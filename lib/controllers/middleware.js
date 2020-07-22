// @ts-check
const errors = require('../errors');
const config = require('../config');
const hostMap = require('../services/host');

const noop = (_, __, next) => next();

let authRateLimit = noop;
let noAuthRateLimit = noop;

if (config.get('redis') === 'true') {
	const rateLimit = require('../services/rate-limiting');
	authRateLimit = rateLimit.authenticated;
	noAuthRateLimit = rateLimit.unauthenticated;
}

/** @type {string} */
const COOKIE_DOMAIN = config.get('domain') || undefined;

/** @type {import('express').CookieOptions} */
const COOKIE_OPTIONS = {
	httpOnly: true,
	// @todo(4.0) ensure this is actually okay
	// @ts-ignore
	secure: 'auto',
	domain: COOKIE_DOMAIN
};

/**
 * @param {import('../../global').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 */
function requireConsent(request, response, next) {
	if (request.session.userProfile) {
		const err = new errors.UnauthorizedError({
			message: 'You must approve account creation before you can do this',
			statusCode: 412
		});

		return next(err);
	}

	next();
}

module.exports = {
	/**
	* @param {import('../../global').Request} request
	* @param {import('express').Response} response
	* @param {import('express').NextFunction} [next]
	*/
	addRedirectCookie(request, response, next) {
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
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('express').Response} response
	* @param {import('express').NextFunction} next
	*/
	requireAuth(request, response, next) {
		if (request.user) {
			return next();
		}

		return response.status(401).end('{"error": "Not Authenticated"}');
	},
	/**
	* Authenticated requests are defined as users who want to use are service
	* - they must be logged in
	* - they must have fully created their account
	* For a minor performance improvement, rate limiting also handles consent
	* @param {import('../../global').Request} request
	* @param {import('express').Response} response
	* @param {import('express').NextFunction} next
	*/
	coreRateLimit(request, response, next) {
		requireConsent(request, response, rcError => {
			if (rcError) {
				return noAuthRateLimit(request, response, rlError => next(rlError || rcError));
			}

			authRateLimit(request, response, next);
		});
	},
	requireConsent,
	/**
	* @param {import('../../global').Request} request
	* @param {import('express').Response} response
	* @param {import('express').NextFunction} next
	*/
	noAuth(request, response, next) {
		if (request.user) {
			if (request.query && 'gb-login' in request.query) {
				return response.redirect('/assets/logged-in.html');
			}

			return response.redirect('/my/');
		}

		next();
	},
	/**
	* @param {void} _
	* @param {import('express').Response} response
	* @param {import('express').NextFunction} next
	*/
	security: (_, response, next) => {
		response.setHeader('Access-Control-Allow-Origin', 'null');
		response.setHeader('X-Frame-Options', 'sameorigin');
		response.setHeader('X-XSS-Protection', '1;mode=block');
		response.setHeader('X-Content-Type-Options', 'nosniff');
		response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
		next();
	},
	/**
	* @param {void} _
	* @param {import('express').Response} response
	* @param {import('express').NextFunction} next
	*/
	noCache: (_, response, next) => {
		response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		next();
	},
	/**
	* @param {import('../../global').Request} request
	* @param {void} _
	* @param {import('express').NextFunction} next
	*/
	hostMatching(request, _, next) {
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
};
