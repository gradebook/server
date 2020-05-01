// @ts-check
const {promisify} = require('util');
const validators = require('../services/validation');
const permissions = require('../services/permissions');

/**
 * @typedef {(req: import('express').Request, res: import('express').Response) => void} NextlessExpressRequest
 */

/**
 * @typedef {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void} ExpressRequest
*/

/**
 * @param {Object} options
 * @param {string} options.validation
 * @param {string} [options.permission],
 * @param {NextlessExpressRequest} options.controller
 * @param {ExpressRequest | null} [options.rateLimit]
 *
 * @description Pipeline a request through the different security contexts.
 *  Note: Permission is optional because it falls back to validation
 * @returns {NextlessExpressRequest}
 */
module.exports = options => {
	const {
		rateLimit = null,
		validation = null,
		permission = options.validation,
		controller = null
	} = options;

	if (!(validation in validators)) {
		throw new Error('Invalid validator');
	}

	if (!(permission in permissions)) {
		throw new Error('Invalid permissable');
	}

	const rateLimiter = rateLimit ? promisify(rateLimit) : Promise.resolve;
	const sanitize = validators[validation];
	const permissable = permissions[permission];

	const pipeline = [rateLimiter, sanitize, permissable, controller];

	return async function pipelineRequest(req, res, next) {
		for (const action of pipeline) {
			try {
				const response = await action(req, res); // eslint-disable-line no-await-in-loop

				if (response === 'ENDED') {
					break;
				}
			} catch (error) {
				return next(error);
			}
		}
	};
};
