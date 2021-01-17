// @ts-check
const {join} = require('path');
const bodyParser = require('body-parser');
const {NotFoundError} = require('../errors');
const config = require('../config');
const isProduction = require('../utils/is-production');
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
	pwa,
	home,
	coreData,
	internal
} = require('../controllers');
const pipeline = require('../controllers/pipeline');
const redirects = require('./redirects');
const frontend = require('./frontend');

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

	app.disable('x-powered-by');
	app.set('env', isProduction ? 'production' : 'development');
	app.set('trust proxy', config.get('trust proxy'));
	app.set('query parser', 'simple');
	app.set('view cache', isProduction);

	// List of redirects to be used. Follows the format [from, to, ]
	redirects.mount(app);
	frontend.mount(app, viewRoot);

	app.get('/robots.txt', (_, res) => res.sendFile(join(viewRoot, './robots.txt')));
	app.get('/', authentication.withUser, home.marketing);

	app.get('/api/v0/version', version.getVersion);
	app.get('/api/v0/internal/refresh-frontend', internal.reloadFrontend);
	app.get('/api/v0/internal/reload-school-config', internal.reloadSchoolConfiguration);
	app.get('/api/v0/health', (_, res) => res.end('Howdy!'));
	app.get('/api/v0/204', (_, res) => res.status(204).end());

	// Only add host matching + auth checking for routes that depend on auth
	app.use(hostMatching);
	app.use(authentication.withUser);

	app.get('/manifest.webmanifest', pwa.getManifest);
	app.get('/pwa-icon.svg', pwa.getFavicon);
	app.get('/pwa-icon-maskable.svg', pwa.getMaskableFavicon);

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

	if (!isProduction) {
		app.use(require('./delay'));
	}

	// Get user profile
	app.get('/api/v0/me', wrap(user.me));
	app.get('/api/v0/feedback', wrap(user.feedback));

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
		controller: user.export,
		serializer: 'exportData'
	}));

	app.get('/api/v0/course/:id', pipeline({
		validation: 'readCourse',
		controller: course.read,
		serializer: 'course'
	}));

	app.get('/api/v0/category/:id', pipeline({
		validation: 'readCategory',
		controller: category.read,
		serializer: 'category'
	}));

	app.get('/api/v0/grade/:id', pipeline({
		validation: 'readGrade',
		controller: grade.read,
		serializer: 'grade'
	}));

	app.get('/api/v0/categories', pipeline({
		validation: 'browseCategory',
		controller: category.browse,
		serializer: 'category'
	}));

	app.get('/api/v0/courses', pipeline({
		validation: 'browseCourse',
		controller: course.browse,
		serializer: 'course'
	}));

	app.get('/api/v0/grades', pipeline({
		validation: 'browseGrade',
		controller: grade.browse,
		serializer: 'grade'
	}));

	app.get('/api/v0/core-data', wrap(coreData.browse));
	app.get('/api/v0/slim-data', wrap(coreData.browseSlim));

	app.use(bodyParser.json({limit: '20kb'}));

	app.put('/api/v0/courses', pipeline({
		validation: 'createCourse',
		controller: course.create,
		serializer: 'course'
	}));

	app.put('/api/v0/courses/import', pipeline({
		rateLimit: 'importCourse',
		validation: 'importCourse',
		controller: course.import,
		serializer: 'importCourse'
	}));

	app.post('/api/v0/course/:id', pipeline({
		validation: 'editCourse',
		controller: course.edit,
		serializer: 'course'
	}));

	app.post('/api/v0/course/:id/settings', pipeline({
		validation: 'courseSettings',
		permission: 'editCourse',
		controller: course.settings,
		serializer: 'course'
	}));

	app.delete('/api/v0/course/:id', pipeline({
		validation: 'deleteCourse',
		controller: course.delete,
		serializer: 'noResponse'
	}));

	app.delete('/api/v0/semester/:semester', pipeline({
		validation: 'deleteSemester',
		controller: semester.delete,
		serializer: 'passThrough'
	}));

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

	app.delete('/api/v0/category/:id', pipeline({
		validation: 'deleteCategory',
		controller: category.delete,
		serializer: 'noResponse'
	}));

	app.put('/api/v0/grades', pipeline({
		validation: 'createGrade',
		controller: grade.create,
		serializer: 'grade'
	}));

	app.post('/api/v0/category/:id/batch', pipeline({
		rateLimit: 'batchEditGrades',
		validation: 'batchEditGrades',
		controller: grade.batchEdit,
		serializer: 'batchEditGrades'
	}));

	app.post('/api/v0/grade/:id', pipeline({
		validation: 'editGrade',
		controller: grade.edit,
		serializer: 'grade'
	}));

	app.delete('/api/v0/grade/:id', pipeline({
		validation: 'deleteGrade',
		controller: grade.delete,
		serializer: 'noResponse'
	}));

	app.post('/api/v0/me/settings', pipeline({
		validation: 'userSettings',
		controller: user.updateSetting,
		serializer: 'passThrough'
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
