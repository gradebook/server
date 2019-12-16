const config = require('../config');
const {validHost, validTable} = require('../utils/host-matching');
const {NotFoundError} = require('../errors');

module.exports.mount = app => {
	if (String(config.get('hostMatching:enabled')) !== 'true') {
		return app.use((req, _, next) => {
			req._table = null;
			next();
		});
	}

	const hosts = config.get('hostMatching:hosts');

	const hostMap = new Map();

	for (const host in hosts) {
		if (!(host in hosts)) {
			continue;
		}

		const table = hosts[host];

		if (!validHost(host)) {
			throw new Error(`Invalid Host: ${host}`);
		}

		if (!validTable(table)) {
			throw new Error(`Invalid Table: ${table}`);
		}

		if (hostMap.has(host)) {
			throw new Error(`Duplicate Host: ${host}`);
		}

		hostMap.set(host, table);
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
