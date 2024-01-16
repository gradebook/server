// @ts-check
import path from 'path';
import {fileURLToPath} from 'url';
import {mkdir} from 'fs/promises';
import {json as jsonMiddleware} from 'express';
import multer from 'multer';
import {allowTrustedIps, TrustedRequestError} from '@gradebook/trusted-request';
import {NotFoundError, ValidationError} from '../errors/index.js';
import config from '../config.js';
import {isProduction} from '../utils/is-production.js';
import {wrapHttp as wrap} from '../utils/http-wrapper.js';
import {
	authentication,
	requireAuth,
	noAuth,
	noCache,
	coreRateLimit,
	hostMatching,
	security,
	user,
	course,
	semester,
	category,
	grade,
	getVersion,
	home,
	coreData,
	internal,
	syllabus,
	MAX_UPLOAD_FILE_SIZE,
	rejectLargeContentType,
} from '../controllers/index.js';
import {pipeline} from '../controllers/pipeline.js';
import {useRedirects} from './redirects.js';
import {useFrontend} from './frontend.js';

export const viewRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../frontend/assets');
/**
 * @name InitializeExpressRoutes
 * @description Load express routes with associated middleware
 * @todo make the param work properly... It's complaining
 * @todo only add redirects and app static for dev env
 * @param {import('express').Application} app the express instance
 */
export const mountApp = app => {
	const usesRedis = String(config.get('redis')) === 'true';
	const trustProxy = config.get('trust proxy');

	app.disable('x-powered-by');
	app.set('env', isProduction ? 'production' : 'development');
	app.set('trust proxy', trustProxy);
	app.set('query parser', 'simple');
	app.set('view cache', isProduction);

	// List of redirects to be used. Follows the format [from, to, ]
	useRedirects(app);
	useFrontend(app);

	app.get('/robots.txt', (_, response) => response.sendFile(path.join(viewRoot, './robots.txt')));
	app.get('/', authentication.withUser, security, home.marketing);

	app.get('/api/v0/version', getVersion);

	app.use('/api/v0/internal', allowTrustedIps({trustProxy, ...config.get('internalRequests')}));
	app.get('/api/v0/internal/refresh-frontend', internal.reloadFrontend);
	app.get('/api/v0/internal/reload-school-config', internal.reloadSchoolConfiguration);

	app.get('/api/v0/health', (_, response) => response.end('Howdy!'));
	app.get('/api/v0/204', (_, response) => response.status(204).end());

	// Only add host matching + auth checking for routes that depend on auth
	app.use(hostMatching);
	app.use(authentication.withUser);

	if (!usesRedis || (usesRedis && !['production', 'test'].includes(config.get('env')))) {
		app.get('/authentication', (_, response) => response.end('login'));
		app.get('/authentication/begin', noAuth, authentication.outgoing);
		app.get('/authentication/callback', authentication.incoming, authentication.redirect);
	}

	app.get('/authentication/end', authentication.terminate);

	// Require authentication for the rest of the endpoints
	app.use('/api', requireAuth);
	// Disallow caching
	app.use('/api', noCache);
	// Add security headers
	app.use(security);

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
		serializer: 'exportData',
	}));

	app.get('/api/v0/course/:id', pipeline({
		validation: 'readCourse',
		controller: course.read,
		serializer: 'course',
	}));

	app.get('/api/v0/category/:id', pipeline({
		validation: 'readCategory',
		controller: category.read,
		serializer: 'category',
	}));

	app.get('/api/v0/grade/:id', pipeline({
		validation: 'readGrade',
		controller: grade.read,
		serializer: 'grade',
	}));

	app.get('/api/v0/categories', pipeline({
		validation: 'browseCategory',
		controller: category.browse,
		serializer: 'category',
	}));

	app.get('/api/v0/courses', pipeline({
		validation: 'browseCourse',
		controller: course.browse,
		serializer: 'course',
	}));

	app.get('/api/v0/grades', pipeline({
		validation: 'browseGrade',
		controller: grade.browse,
		serializer: 'grade',
	}));

	app.get('/api/v0/core-data', wrap(coreData.browse));
	app.get('/api/v0/slim-data', wrap(coreData.browseSlim));

	app.use(jsonMiddleware({limit: '20kb'}));

	const createCourse = pipeline({
		rateLimit: 'createCourse',
		validation: 'createCourse',
		controller: course.create,
		serializer: 'createCourse',
	});

	app.put('/api/v0/courses', createCourse);

	app.post('/api/v0/course/:id/complete', pipeline({
		validation: 'completeCreateCourse',
		controller: course.completeCreate,
		serializer: 'createCourse',
	}));

	app.put('/api/v0/courses/import', createCourse);

	app.post('/api/v0/course/:id', pipeline({
		validation: 'editCourse',
		controller: course.edit,
		serializer: 'course',
	}));

	app.post('/api/v0/course/:id/settings', pipeline({
		validation: 'courseSettings',
		permission: 'editCourse',
		controller: course.settings,
		serializer: 'course',
	}));

	app.delete('/api/v0/course/:id', pipeline({
		validation: 'deleteCourse',
		controller: course.delete,
		serializer: 'noResponse',
	}));

	app.delete('/api/v0/semester/:semester', pipeline({
		validation: 'deleteSemester',
		controller: semester.delete,
		serializer: 'passThrough',
	}));

	app.put('/api/v0/categories', pipeline({
		validation: 'createCategory',
		controller: category.create,
		serializer: 'category',
	}));

	app.post('/api/v0/category/:id', pipeline({
		validation: 'editCategory',
		controller: category.edit,
		serializer: 'category',
	}));

	app.delete('/api/v0/category/:id', pipeline({
		validation: 'deleteCategory',
		controller: category.delete,
		serializer: 'noResponse',
	}));

	app.put('/api/v0/grades', pipeline({
		validation: 'createGrade',
		controller: grade.create,
		serializer: 'grade',
	}));

	app.post('/api/v0/category/:id/batch', pipeline({
		rateLimit: 'batchEditGrades',
		validation: 'batchEditGrades',
		controller: grade.batchEdit,
		serializer: 'batchEditGrades',
	}));

	app.post('/api/v0/grade/:id', pipeline({
		validation: 'editGrade',
		controller: grade.edit,
		serializer: 'grade',
	}));

	app.delete('/api/v0/grade/:id', pipeline({
		validation: 'deleteGrade',
		controller: grade.delete,
		serializer: 'noResponse',
	}));

	app.post('/api/v0/me/settings', pipeline({
		validation: 'userSettings',
		controller: user.updateSetting,
		serializer: 'passThrough',
	}));

	app.post('/api/v0/me/settings/gpa', pipeline({
		validation: 'userGpaSettings',
		controller: user.updateGpaSettings,
		serializer: 'passThrough',
	}));

	if (config.get('userIssueReporting')) {
		app.post('/api/v0/me/report-an-issue', pipeline({
			rateLimit: 'reportAnIssue',
			validation: 'reportAnIssue',
			controller: user.reportAnIssue,
			serializer: 'passThrough',
		}));
	}

	if (config.get('userUploadsRoot')) {
		mkdir(config.get('userUploadsRoot'), {recursive: true});
		app.post('/api/v0/syllabus/link', pipeline({
			rateLimit: 'syllabus',
			validation: 'linkSyllabus',
			controller: syllabus.link,
			serializer: 'passThrough',
		}));

		const readFile = multer({
			limits: {
				fileSize: MAX_UPLOAD_FILE_SIZE,
				files: 1,
			},
		});

		app.post('/api/v0/syllabus/upload/:id', rejectLargeContentType, readFile.single('file'), pipeline({
			rateLimit: 'syllabus',
			validation: 'uploadSyllabus',
			controller: syllabus.upload,
			serializer: 'passThrough',
		}));
	}

	// Catch 404 and forward to error handler
	app.use((_, __, next) => {
		next(new NotFoundError());
	});

	// Error handler
	app.use((error, request, response, next) => {
		const isTrustedRequestError = error instanceof TrustedRequestError;
		request.err = error;

		if (response.headersSent) {
			return next(error);
		}

		if (error instanceof multer.MulterError) {
			error = new ValidationError({message: 'Invalid file', err: error});
		}

		const status = error.statusCode || (isTrustedRequestError ? 404 : 500);

		if (request.path.startsWith('/api/v0')) {
			response.status(status);

			if (status >= 400 && status < 500) {
				const output = {error: error.message};
				if (error.context && !isTrustedRequestError) {
					output.context = error.context;
				}

				return response.json(output);
			}

			return response.json({
				error: 'An unexpected error occurred. Please try again, and if the problem persists, contact support',
			});
		}

		response.locals.status = status;

		if (status === 404) {
			return response.status(404).prettyError();
		}

		response.locals.error = error;
		response.status(status).prettyError();
	});
};
