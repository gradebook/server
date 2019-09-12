const config = require('../../config');
const Limiter = require('./limiter');

const TWO_MINS = 120000;

const DEFAULT_BATCH_GRADES = {
	freeRetries: 2,
	// User must wait until brute lifetime has passed
	minWait: TWO_MINS,
	maxWait: TWO_MINS,
	lifetime: 60
};

const limiter = new Limiter(config.get('rateLimit.batchEditGrades', DEFAULT_BATCH_GRADES));

module.exports = limiter.mw;
