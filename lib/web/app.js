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
const pipeline = require('../controllers/pipeline');
const redirects = require('./redirects');

const {requireAuth, noAuth, noCache, coreRateLimit, hostMatching} = middleware;
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
	const isProduction = config.get('env') === 'production';

	app.disable('x-powered-by');
	app.set('trust proxy', config.get('trust proxy'));

	// List of redirects to be used. Follows the format [from, to, ]
	redirects.mount(app);

	app.get('/my', hostMatching, authentication.withUser, home.app);

	// Check if the file exists locally, or forward the request to the frontend
	app.use('/my',
		hostMatching,
		express.static(join(__dirname, '../frontend/client/release')),
		authentication.withUser,
		home.app
	);
	app.get('/robots.txt', (_, res) => res.sendFile(join(viewRoot, './robots.txt')));
	app.get('/', authentication.withUser, home.marketing(isProduction));

	if (!isProduction) {
		app.use('/assets', express.static(viewRoot));
	}

	app.get('/api/v0/version', version.getVersion);
	app.get('/api/v0/internal/refresh-frontend', internal.refresh);
	app.get('/api/v0/health', (_, res) => res.end('Howdy!'));

	// Only add host matching + auth checking for routes that depend on auth
	app.use(hostMatching);
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

	app.get('/api/v0/me/export-data', pipeline({
		rateLimit: 'exportData',
		validation: 'exportData',
		controller: user.export
		// serializer: null
	}));

	app.get('/api/v0/course/:id', pipeline({
		validation: 'readCourse',
		controller: course.read
		// serializer: null
	}));

	app.get('/api/v0/category/:id', pipeline({
		validation: 'readCategory',
		controller: category.read,
		serializer: 'category'
	}));

	app.get('/api/v0/grade/:id', pipeline({
		validation: 'readGrade',
		controller: grade.read
		// serializer: null
	}));

	app.get('/api/v0/categories', pipeline({
		validation: 'browseCategory',
		controller: category.browse,
		serializer: 'category'
	}));

	app.get('/api/v0/courses', pipeline({
		validation: 'browseCourse',
		controller: course.browse
		// serializer: null
	}));

	app.get('/api/v0/grades', pipeline({
		validation: 'browseGrade',
		controller: grade.browse
		// serializer: null
	}));

	app.get('/api/v0/core-data', wrap(coreData.browse));

	app.use(bodyParser.json({limit: '10kb'}));

	app.put('/api/v0/courses', pipeline({
		validation: 'createCourse',
		controller: course.create
		// serializer: null
	}));
	// Import course template
	app.put('/api/v0/courses/import', pipeline({
		rateLimit: 'importCourse',
		validation: 'importCourse',
		controller: course.import
		// serializer: null
	}));
	app.post('/api/v0/course/:id', pipeline({
		validation: 'editCourse',
		controller: course.edit
		// serializer: null
	}));

	app.delete('/api/v0/course/:id', pipeline({
		validation: 'deleteCourse',
		controller: course.delete
		// serializer: null
	}));

	app.delete('/api/v0/semester/:semester', wrap(semester.delete)); // Delete courses by semester

	app.put('/api/v0/categories', pipeline({
		validation: 'createCategory',
		controller: category.create,
		serializer: 'category'
	}));

	app.post('/api/v0/category/:id', pipeline({
		validation: 'editCategory',
		controller: category.edit,
		serializer: 'category'
	}));

	app.post('/api/v0/category/:id/expand', pipeline({
		validation: 'expandCategory',
		controller: category.expand,
		serializer: 'grade'
	}));

	app.post('/api/v0/category/:id/contract', pipeline({
		validation: 'contractCategory',
		controller: category.contract
		// serializer: null
	}));

	app.delete('/api/v0/category/:id', pipeline({
		validation: 'deleteCategory',
		controller: category.delete
		// serializer: null
	}));


	app.put('/api/v0/grades', pipeline({
		validation: 'createGrade',
		controller: grade.create
		// serializer: null
	}));

	app.post('/api/v0/category/:id/batch', pipeline({
		rateLimit: 'batchEditGrades',
		validation: 'batchEditGrades',
		controller: grade.batchEdit
		// serializer: null
	}));

	app.post('/api/v0/grade/:id', pipeline({
		validation: 'editGrade',
		controller: grade.edit
		// serializer: null
	}));

	app.delete('/api/v0/grade/:id', pipeline({
		validation: 'deleteGrade',
		controller: grade.delete
		// serializer: null
	}));

	app.post('/api/v0/me/settings', pipeline({
		validation: 'userSettings',
		controller: user.updateSetting
		// serializer: null
	}));


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
