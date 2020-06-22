// @ts-check
const errors = require('../errors');
const config = require('../config');
const hostMap = require('../services/host');

const noop = (_, __, next) => next();

let authRateLimit = noop;
let noAuthRateLimit = noop;

if (config.get('redis') === 'true') {
	const rateLimit = require('../services/rate-limiting');
	authRateLimit = rateLimit.unauthenticated;
	noAuthRateLimit = rateLimit.authenticated;
}

/** @type string */
const COOKIE_DOMAIN = config.get('domain') || undefined;

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: 'auto',
	domain: COOKIE_DOMAIN
};

/**
 * @param {import('../../global').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireConsent(req, res, next) {
	if (req.session.userProfile) {
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
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	* @param {import('express').NextFunction} next
	*/
	addRedirectCookie(req, res, next) {
		let userSettings = req.user.settings;
		if (typeof userSettings === 'string') {
			userSettings = JSON.parse(userSettings);
		}

		if (userSettings && userSettings.redirectFromHome) {
			// Gradebook auto redirect
			// @NOTE: the slug is NOT stored in the cookie
			res.cookie('gbardr', 'dinklemeyer', COOKIE_OPTIONS);
		} else {
			res.clearCookie('gbardr', {domain: COOKIE_DOMAIN});
		}

		next();
	},
	/**
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	* @param {import('express').NextFunction} next
	*/
	requireAuth(req, res, next) {
		if (req.user) {
			return next();
		}

		return res.status(401).end('{"error": "Not Authenticated"}');
	},
	/**
	* Authenticated requests are defined as users who want to use are service
	* - they must be logged in
	* - they must have fully created their account
	* For a minor performance improvement, rate limiting also handles consent
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	* @param {import('express').NextFunction} next
	*/
	coreRateLimit(req, res, next) {
		requireConsent(req, res, rcError => {
			if (rcError) {
				return noAuthRateLimit(req, res, rlError => next(rlError || rcError));
			}

			authRateLimit(req, res, next);
		});
	},
	requireConsent,
	/**
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	* @param {import('express').NextFunction} next
	*/
	noAuth(req, res, next) {
		if (req.user) {
			if (req.query && 'gb-login' in req.query) {
				return res.redirect('/assets/logged-in.html');
			}

			return res.redirect('/my/');
		}

		next();
	},
	/**
	* @param {void} _
	* @param {import('express').Response} res
	* @param {import('express').NextFunction} next
	*/
	security: (_, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', 'null');
		res.setHeader('X-Frame-Options', 'sameorigin');
		res.setHeader('X-XSS-Protection', '1;mode=block');
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
		next();
	},
	/**
	* @param {void} _
	* @param {import('express').Response} res
	* @param {import('express').NextFunction} next
	*/
	noCache: (_, res, next) => {
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		next();
	},
	/**
	* @param {import('../../global').Request} req
	* @param {void} _
	* @param {import('express').NextFunction} next
	*/
	hostMatching(req, _, next) {
		if (!hostMap) {
			req._domain = req.hostname.split(':').pop();
			req._table = null;
			return next();
		}

		const hostname = req.hostname.split(':').pop();

		if (!hostMap.has(hostname)) {
			return next(new errors.NotFoundError({context: 'Invalid origin'}));
		}

		req._table = hostMap.get(hostname);
		req._domain = hostname;
		next();
	}
};
