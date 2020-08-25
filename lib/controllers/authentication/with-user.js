// @ts-check
const session = require('express-session');
const passport = require('passport');
const config = require('../../config');
const settings = require('../../services/settings');
const store = require('../../utils/get-session-store');

const sessionOptions = {
	name: 'agbsid',
	secret: settings.get('session_secret'),
	saveUninitialized: false,
	resave: false,
	rolling: true,
	cookie: {
		secure: config.get('secure'),
		maxAge: config.get('session length'), // Defaults to ~1 week
		httpOnly: true,
		path: '/',
		domain: config.get('domain')
	},
	store
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
		const redirect = new URL(request._passportRedirect, request.path);
		return response.status(302).redirect(redirect.href);
	}

	next();
};

module.exports = [
	session(sessionOptions),
	passport.initialize(),
	passport.session(),
	redirectUser
];
