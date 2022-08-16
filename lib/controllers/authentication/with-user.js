// @ts-check
import session from 'express-session';
import passport from 'passport';
import config from '../../config.js';
import {settings} from '../../services/settings/index.js';
import store from '../../utils/get-session-store.js';

const sessionOptions = {
	name: config.get('sessionCookie'),
	secret: settings.get('session_secret'),
	saveUninitialized: false,
	resave: false,
	rolling: true,
	cookie: {
		secure: config.get('secure'),
		maxAge: config.get('session length'), // Defaults to ~1 week
		httpOnly: true,
		path: '/',
		domain: config.get('domain'),
	},
	store,
};

/**
 * @param {import('@gradebook/passport-utils').BasicRequest & import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 */
const redirectUser = (request, response, next) => {
	if (request._passportRedirect) {
		// URL is defined in lib.dom.ts which is not part of the known node variables
		// URL is a node global though, so this isn't an error
		// @todo: add a tsconfig that specifies what libs are being used
		// @ts-ignore
		const redirect = new URL(request.originalUrl, request._passportRedirect.replace('//', `${request.protocol}://`));
		if (request.path === '/api/v0/me') {
			response.status(200).json({redirect: redirect.href});
		} else {
			response.status(302).redirect(redirect.href);
		}

		return;
	}

	next();
};

export const withUser = [
	session(sessionOptions),
	passport.initialize(),
	passport.session(),
	redirectUser,
];

export default withUser;
