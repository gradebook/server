// @ts-check

import {InternalServerError} from '../../errors/index.js';

/**
 * @param {(input: object) => object} serialize
 * @returns {(
 * req: Gradebook.Request,
 * res: Gradebook.ResponseWithContext
 * ) => void
 * }
 */
export function wrapSerializer(serialize) {
	return (request, response) => {
		const {statusCode = 200, body} = response.context;

		if (statusCode === 204) {
			response.status(204).end();
			return response;
		}

		if (typeof body === 'object') {
			if (Array.isArray(body)) {
				body.forEach(realContext => serialize(realContext)); // eslint-disable-line unicorn/no-array-for-each
			} else {
				serialize(body);
			}

			response
				.status(statusCode)
				.set('content-type', 'application/json')
				.end(JSON.stringify(body));
		} else if (body) {
			response.status(statusCode).send(body);
		} else {
			throw new InternalServerError({message: 'No response data was provided! If this is expected, be sure to set the statusCode to `204`.'});
		}
	};
}
