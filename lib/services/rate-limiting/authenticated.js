const config = require('../../config');
const Limiter = require('./limiter');

const TWO_MINS = 120000;

const DEFAULT_AUTH_CONFIG = {
	freeRetries: 124,
	// User must wait until brute lifetime has passed
	minWait: TWO_MINS,
	maxWait: TWO_MINS,
	lifetime: 60
};

const limiter = new Limiter(config.get('rateLimit.authenticated', DEFAULT_AUTH_CONFIG));

module.exports = limiter.mw;
