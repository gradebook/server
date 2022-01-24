// @ts-check
import Brute from 'express-brute';
import Store from '@gradebook/express-brute-redis';
import * as errors from '../../errors/index.js';
import log from '../../logging.js';
import {redis} from '../../database/redis.js';

const store = new Store({
	client: redis,
	prefix: 'brute:',
});

function failCallback(request, response, next) {
	const context = `${request.method.toUpperCase()} ${request.path}`;
	log.info(`${request.user.id} rate limited ${context}`);
	next(new errors.TooManyRequestsError({
		message: 'You\'ve been rate limited, please try again in a few minutes. We\'ve logged this and will modify our rate limits if needed :)',
		context,
	}));
}

function handleStoreError(error) {
	const customError = new errors.InternalServerError({
		message: 'Unknown error',
		err: error.parent ? error.parent : error,
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
	handleStoreError,
}, options);

export class RateLimiter {
	constructor(options, name = 'rateLimiter') {
		this.limiter = new Brute(store, createOptions(options));
		this.mw = this.limiter.getMiddleware(({
			ignoreIP: false,
			key(request, _, next) {
				if (request.user) {
					return next(request.user.id);
				}

				// Since ignoreIP is set to false, the ip is added by express-brute
				next(name);
			},
		}));
	}
}
