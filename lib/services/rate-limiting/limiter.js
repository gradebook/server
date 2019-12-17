const Brute = require('express-brute');
const Store = require('brute-knex');
const {knex: {instance: knex}} = require('../../database');
const errors = require('../../errors');
const log = require('../../logging');

const store = new Store({
	tablename: 'brute',
	createTable: false,
	knex
});

function failCallback(req, res, next) {
	const context = `${req.method.toUpperCase()} ${req.path}`;
	log.info(`${req.user.id} rate limited ${context}`);
	next(new errors.TooManyRequestsError({
		message: 'You\'ve been rate limited, please try again in a few minutes. We\'ve logged this and will modify our rate limits if needed :)',
		context
	}));
}

function handleStoreError(error) {
	const customError = new errors.InternalServerError({
		message: 'Unknown error',
		err: error.parent ? error.parent : error
	});

	// See https://github.com/AdamPflug/express-brute/issues/45
	//  - express-brute does not always forward a callback
	//  - we are using reset as synchronous call, so we have to log the error if it occurs
	//  - there is no way to try/catch, because the reset operation is async
	if (!error.next) {
		log.error(error);
		return;
	}

	error.next(customError);
}

const createOptions = options => Object.assign({
	refreshTimeoutOnRequest: false, // Rate limit starts from earliest request, not last
	attachResetToRequest: false, // Rate limits can't be reset here
	failCallback,
	handleStoreError
}, options);

module.exports = class RateLimiter {
	constructor(options, name = 'rateLimiter') {
		this.limiter = new Brute(store, createOptions(options));
		this.mw = this.limiter.getMiddleware(({
			ignoreIP: false,
			key(req, _, next) {
				if (req.user) {
					return next(req.user.id);
				}

				// Since ignoreIP is set to false, the ip is added by express-brute
				next(name);
			}
		}));
	}
};
