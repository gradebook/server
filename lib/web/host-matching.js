// @ts-check
const hostMap = require('../services/host');
const {NotFoundError} = require('../errors');

module.exports.mount = app => {
	if (!hostMap) {
		return app.use((req, _, next) => {
			req._domain = req.hostname.split(':').pop();
			req._table = null;
			next();
		});
	}

	app.use(function addTableMap(req, res, next) {
		const hostname = req.hostname.split(':').pop();

		if (!hostMap.has(hostname)) {
			return next(new NotFoundError());
		}

		req._table = hostMap.get(hostname);
		req._domain = hostname;
		next();
	});
};
