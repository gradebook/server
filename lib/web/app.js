// @ts-check
const {join} = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const {NotFoundError} = require('../errors');
const config = require('../config');
const wrap = require('../utils/http-wrapper');
const {
	authentication,
	middleware,
	user,
	course,
	semester,
	category,
	grade,
	version,
	home,
	coreData,
	internal
} = require('../controllers');
const validation = require('../services/validation');
const permission = require('../services/permissions');
const rateLimit = require('../services/rate-limiting');
const redirects = require('./redirects');

const {requireAuth, noAuth, noCache, coreRateLimit} = middleware;
const viewRoot = join(__dirname, '../frontend/assets');
/**
 * @name InitializeExpressRoutes
 * @description Load express routes with associated middleware
 * @todo make the param work properly... It's complaining
 * @todo only add redirects and app static for dev env
 * @param {object} app the express instance
 */
module.exports.mount = app => {
	const usesRedis = String(config.get('redis')) === 'true';

	app.disable('x-powered-by');
	app.set('trust proxy', config.get('trust proxy'));

	// List of redirects to be used. Follows the format [from, to, ]
	redirects.mount(app);

	app.get('/', authentication.withUser, home.marketing);

	// Handle match for index.html
	app.get('/my', authentication.withUser, home.app);

	// Check if the file exists locally, or forward the request to the frontend
	app.use('/my', express.static(join(__dirname, '../frontend/client/release')), authentication.withUser, home.app);
	app.get('/robots.txt', (_, res) => res.sendFile(join(viewRoot, './robots.txt')));

	if (config.get('env') !== 'production') {
		app.use('/assets', express.static(viewRoot));
	}

	app.get('/api/v0/version', version.getVersion);
	app.get('/api/v0/internal/refresh-frontend', internal.refresh);

	// Only add auth checking for routes that depend on auth
	app.use(authentication.withUser);

	if (!usesRedis || (usesRedis && !['production', 'test'].includes(config.get('env')))) {
		app.get('/authentication', (_, res) => res.end('login'));
		app.get('/authentication/begin', noAuth, authentication.outgoing);
		app.get('/authentication/callback', authentication.incoming, authentication.redirect);
	}

	app.get('/authentication/end', authentication.terminate);

	// Require authentication for the rest of the endpoints
	app.use('/api', requireAuth);
	// Disallow caching
	app.use('/api', noCache);
	// Add security headers
	app.use(middleware.security);

	// Get user profile
	app.get('/api/v0/me', wrap(user.me));

	const runApproval = wrap(user.approve);
	// Approve account creation (in case you logged in with the wrong account)
	app.put('/api/v0/me/approve', runApproval);

	if (usesRedis) {
		app.get('/api/v0/me/approve', user.approveFromSession, runApproval);
	}

	app.delete('/api/v0/me', wrap(user.delete));

	app.use('/api', coreRateLimit);

	app.get('/api/v0/me/export-data', rateLimit('exportData'), wrap(user.export));

	app.get('/api/v0/course/:id', validation('readCourse'), permission('readCourse'), wrap(course.read));
	app.get('/api/v0/category/:id', validation('readCategory'), permission('readCategory'), wrap(category.read));
	app.get('/api/v0/grade/:id', validation('readGrade'), permission('readGrade'), wrap(grade.read));
	app.get('/api/v0/categories', validation('browseCategory'), permission('browseCategory'), wrap(category.browse));
	app.get('/api/v0/courses', validation('browseCourse'), permission('browseCourse'), wrap(course.browse));
	app.get('/api/v0/grades', validation('browseGrade'), permission('browseGrade'), wrap(grade.browse));
	app.get('/api/v0/core-data', wrap(coreData.browse));
	app.get('/api/v0/health', (_, res) => res.end('Howdy!'));

	app.use(bodyParser.json({limit: '10kb'}));

	app.put('/api/v0/courses', validation('createCourse'), permission('createCourse'), wrap(course.create));
	app.post('/api/v0/course/:id', validation('editCourse'), permission('editCourse'), wrap(course.edit));
	app.delete('/api/v0/course/:id', validation('deleteCourse'), permission('deleteCourse'), wrap(course.delete));
	app.delete('/api/v0/semester/:semester', wrap(semester.delete)); // Delete courses by semester

	app.put('/api/v0/categories', validation('createCategory'), permission('createCategory'), wrap(category.create));
	app.post('/api/v0/category/:id', validation('editCategory'), permission('editCategory'), wrap(category.edit));
	app.post('/api/v0/category/:id/expand', validation('expandCategory'), permission('editCategory'), wrap(category.expand));
	app.delete('/api/v0/category/:id', validation('deleteCategory'), permission('deleteCategory'), wrap(category.delete));

	app.put('/api/v0/grades', validation('createGrade'), permission('createGrade'), wrap(grade.create));
	// Batch Edit Grades
	app.post('/api/v0/category/:id/batch',
		rateLimit('batchEditGrades'),
		validation('batchEditGrades'),
		permission('batchEditGrades'),
		wrap(grade.batchEdit)
	);
	app.post('/api/v0/grade/:id', validation('editGrade'), permission('editGrade'), wrap(grade.edit));
	app.delete('/api/v0/grade/:id', validation('deleteGrade'), permission('deleteGrade'), wrap(grade.delete));
	app.post('/api/v0/me/settings', validation('userSettings'), wrap(user.updateSetting));

	// Catch 404 and forward to error handler
	app.use((_, __, next) => {
		next(new NotFoundError());
	});

	// Error handler
	app.use((error, req, res, next) => {
		req.err = error;

		if (res.headersSent) {
			return next(error);
		}

		const status = error.statusCode || 500;

		if (req.path.startsWith('/api/v0')) {
			res.status(status);

			if (status >= 400 && status < 500) {
				const output = {error: error.message};
				if (error.context) {
					output.context = error.context;
				}

				return res.json(output);
			}

			return res.end();
		}

		res.locals.status = status;

		if (status === 404) {
			return res.status(404).prettyError();
		}

		res.locals.error = error;
		res.status(status).prettyError();
	});
};
