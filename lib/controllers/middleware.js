const rateLimit = require('../services/rate-limiting');

const authRateLimit = rateLimit('unauthenticated');
const noAuthRateLimit = rateLimit('authenticated');

function requireConsent(req, res, next) {
	if (req.user.isNew) {
		const err = new Error('You must approve account creation before you can do this');
		err.statusCode = 412;
		return next(err);
	}

	next();
}

module.exports = {
	requireAuth(req, res, next) {
		if (req.user) {
			return next();
		}

		return res.status(401).end('{"error": "Not Authenticated"}');
	},
	// Authenticated requests are defined as users who want to use are service
	// - they must be logged in
	// - they must have fully created their account
	// For a minor performance improvement, rate limiting also handles consent
	coreRateLimit(req, res, next) {
		requireConsent(req, res, rcError => {
			if (rcError) {
				return noAuthRateLimit(req, res, rlError => next(rlError || rcError));
			}

			authRateLimit(req, res, next);
		});
	},
	requireConsent,
	noAuth(req, res, next) {
		if (req.user) {
			return res.redirect('/app/');
		}

		next();
	},
	security: (_, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', 'null');
		res.setHeader('X-Frame-Options', 'sameorigin');
		res.setHeader('X-XSS-Protection', '1;mode=block');
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
		next();
	},
	noCache: (_, res, next) => {
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		next();
	}
};
