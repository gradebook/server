// @ts-check
import * as errors from '../errors/index.js';
import config from '../config.js';
import hostMap from '../services/host.js';

const noop = (_, __, next) => next();

let authRateLimit = noop;
let noAuthRateLimit = noop;

if (String(config.get('redis')) === 'true') {
	const rateLimit = await import('../services/rate-limiting/index.js');
	authRateLimit = rateLimit.authenticated;
	noAuthRateLimit = rateLimit.unauthenticated;
}

/** @type {string} */
const COOKIE_DOMAIN = config.get('domain') || undefined;

/** @type {import('express').CookieOptions} */
const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: config.get('secure'),
	domain: COOKIE_DOMAIN,
};

/**
 * @param {Gradebook.Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 */
export function requireConsent(request, response, next) {
	if (request.session.userProfile) {
		const error = new errors.UnauthorizedError({
			message: 'You must approve account creation before you can do this',
			statusCode: 412,
		});

		return next(error);
	}

	next();
}

/**
* @param {Gradebook.Request} request
* @param {import('express').Response} response
* @param {import('express').NextFunction} [next]
*/
export function addRedirectCookie(request, response, next) {
	let userSettings = request.user.settings;
	if (typeof userSettings === 'string') {
		userSettings = JSON.parse(userSettings);
	}

	if (userSettings && userSettings.redirectFromHome) {
		// Gradebook auto redirect
		// @NOTE: the slug is NOT stored in the cookie
		response.cookie('gbardr', 'dinklemeyer', COOKIE_OPTIONS);
	} else {
		response.clearCookie('gbardr', {domain: COOKIE_DOMAIN});
	}

	if (next) {
		next();
	}
}

/**
* @param {Gradebook.Request} request
* @param {import('express').Response} response
* @param {import('express').NextFunction} next
*/
export function requireAuth(request, response, next) {
	if (request.user) {
		return next();
	}

	return response.status(401).end('{"error": "Not Authenticated"}');
}

/**
* Authenticated requests are defined as users who want to use are service
* - they must be logged in
* - they must have fully created their account
* For a minor performance improvement, rate limiting also handles consent
* @param {Gradebook.Request} request
* @param {import('express').Response} response
* @param {import('express').NextFunction} next
*/
export function coreRateLimit(request, response, next) {
	requireConsent(request, response, rcError => {
		if (rcError) {
			return noAuthRateLimit(request, response, rlError => next(rlError || rcError));
		}

		authRateLimit(request, response, next);
	});
}

/**
* @param {Gradebook.Request} request
* @param {import('express').Response} response
* @param {import('express').NextFunction} next
*/
export function noAuth(request, response, next) {
	if (request.user) {
		if (request.query && 'gb-login' in request.query) {
			return response.redirect('/assets/logged-in.html');
		}

		return response.redirect('/my/');
	}

	next();
}

/**
* @param {unknown} _
* @param {import('express').Response} response
* @param {import('express').NextFunction} next
*/
export function security(_, response, next) {
	response.setHeader('Access-Control-Allow-Origin', 'null');
	response.setHeader('X-Frame-Options', 'sameorigin');
	response.setHeader('X-Content-Type-Options', 'nosniff');
	response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
	next();
}

/**
* @param {unknown} _
* @param {import('express').Response} response
* @param {import('express').NextFunction} next
*/
export function noCache(_, response, next) {
	response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	next();
}

/**
* @param {Gradebook.Request} request
* @param {Gradebook.Response} _
* @param {import('express').NextFunction} next
*/
export function hostMatching(request, _, next) {
	if (!hostMap) {
		request._domain = request.hostname.split(':').pop();
		request._table = null;
		return next();
	}

	const hostname = request.hostname.split(':').pop();

	if (!hostMap.has(hostname)) {
		return next(new errors.NotFoundError({context: 'Invalid origin'}));
	}

	request._table = hostMap.get(hostname);
	request._domain = hostname;
	next();
}
