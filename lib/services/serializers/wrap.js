// @ts-check
/**
 * @param {(input: object) => object} serialize
 * @returns {(
 * req: import('../../../global.d').Request,
 * res: import('../../../global.d').ResponseWithContext
 * ) => void
 * }
 */
module.exports = function wrapSerializer(serialize) {
	return (req, res) => {
		const {context} = res;
		const statusCode = context.statusCode || 200;

		if (statusCode === 204) {
			return res.status(204).end();
		}

		if (Array.isArray(context.body)) {
			context.body.forEach(realContext => serialize(realContext));
		} else {
			serialize(context);
		}

		res.status(statusCode).json(context.body);
	};
};
