const config = require('../../config');
const Limiter = require('./limiter');

const OVER_SIX_HOURS = 21601000;

const DEFAULT_EXPORT_CONFIG = {
	freeRetries: 2, // MAX_TRIES - 1
	// User must wait until brute lifetime has passed
	minWait: OVER_SIX_HOURS,
	maxWait: OVER_SIX_HOURS,
	lifetime: 60 * 60 * 6
};

const limiter = new Limiter(config.get('rateLimit.exportData', DEFAULT_EXPORT_CONFIG));

module.exports = limiter.mw;
