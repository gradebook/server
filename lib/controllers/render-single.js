const api = require('../api');
const {BaseError} = require('../errors');

module.exports = function renderSingle(type, additionalData = {}, relations = []) {
	return async (req, res, next) => {
		const single = await api[type].read(req.params.id, relations).catch(error => error);
		if (single instanceof BaseError) {
			single.type = type;
			return next(single);
		}

		if (single && Object.keys(single).length > 0) {
			const data = Object.assign({}, {[type]: single}, additionalData);
			return res.render(type, data);
		}
	};
};
