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

		serialize(context.body);

		res.status(statusCode).json(context.body);
	};
};
