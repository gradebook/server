// @ts-check
const {promisify} = require('util');
const validators = require('../services/validation');
const permissions = require('../services/permissions');
const serializers = require('../services/serializers');
const config = require('../config');

const disabled = () => Promise.resolve();

/**
 * @typedef {(
 * req: Gradebook.Request<any>,
 * res: Gradebook.ResponseWithContext
 * ) => any | Promise<any>
 * } NextlessExpressRequest
 */

/**
 * @typedef {(
 * req: Gradebook.Request<any>,
 * res: Gradebook.ResponseWithContext,
 * next: import('express').NextFunction
 * ) => void
 * } ExpressRequest
*/

/**
 * Pipeline a request through the different security contexts.
 *  Note: Permission is optional because it falls back to validation
 *
 * @param {Object} options
 * @param {keyof typeof validators} options.validation
 * @param {keyof typeof permissions} [options.permission]
 * @param {NextlessExpressRequest} options.controller
 * @param {keyof typeof import('../services/rate-limiting')} [options.rateLimit]
 * @param {string | NextlessExpressRequest} options.serializer
 * @returns {ExpressRequest}
 */
module.exports = options => {
	const {
		rateLimit = null,
		validation = null,
		permission = options.validation,
		controller = null,
		serializer = null,
	} = options;

	if (!(validation in validators)) {
		throw new Error('Invalid validator');
	}

	if (!(permission in permissions)) {
		throw new Error('Invalid permissable');
	}

	if (!controller) {
		throw new Error('Missing controller');
	}

	if (typeof serializer === 'string' && !(serializer in serializers)) {
		throw new Error('Invalid output serializer');
	}

	/** @type {(...args : any[]) => Promise<any>} */
	let rateLimiter = disabled;

	if (String(config.get('redis')) === 'true' && rateLimit) {
		const rateLimits = require('../services/rate-limiting');
		if (rateLimit && !(rateLimit in rateLimits)) {
			throw new Error('Invalid RateLimiter');
		}

		rateLimiter = promisify(rateLimits[rateLimit]);
	}

	const sanitize = validators[validation];
	const permissable = permissions[permission];
	const serialize = typeof serializer === 'string' ? serializers[serializer] : serializer;

	const pipeline = [rateLimiter, sanitize, permissable, controller, serialize];

	return async function pipelineRequest(request, response, next) {
		for (const action of pipeline) {
			try {
				const result = await action(request, response); // eslint-disable-line no-await-in-loop

				// CASE: returned the http response which means the middleware sent a response to
				// the client. If that's the case, there's nothing for us to do.
				if (result === response) {
					break;
				}
			} catch (error) {
				error.message += ` Controller: ${controller.name}`;
				return next(error);
			}
		}
	};
};
