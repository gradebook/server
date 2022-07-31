// @ts-check
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
			return response.status(204).end();
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
		} else {
			response.status(statusCode).send(body);
		}
	};
}
