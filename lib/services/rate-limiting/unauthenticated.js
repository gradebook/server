const config = require('../../config');
const Limiter = require('./limiter');

const TWO_MINS = 120000;

const DEFAULT_NOAUTH_CONFIG = {
	freeRetries: 50,
	// User must wait until brute lifetime has passed
	minWait: TWO_MINS,
	maxWait: TWO_MINS,
	lifetime: 60
};

const limiter = new Limiter(config.get('rateLimit.unauthenticated', DEFAULT_NOAUTH_CONFIG));

module.exports = limiter.mw;
