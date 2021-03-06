// @ts-check
const log = require('../logging');
const {BaseError, InternalServerError} = require('../errors');

let lastHealthLog = 0;

module.exports.mount = app => {
	if (process.env.NODE_ENV === 'testing') {
		return;
	}

	app.use(function logRequest(req, res, next) {
		const startTime = Date.now();

		function logResponse() {
			let {err, _table: db} = req;
			res.responseTime = `${Date.now() - startTime}ms`;

			res.removeListener('finish', logResponse);
			res.removeListener('close', logResponse);

			/**
			 * Don't error log
			 *  1. Requests without errors
			 *  2. 404 (Not Found) errors
			 *  3. Validation Errors
			 *  4. Precondition Failed Errors
			 */
			if (!err || err.statusCode === 404 || err.statusCode === 422 || err.statusCode === 412) {
				if (err && err.statusCode === 422) {
					const contextString = Array.isArray(err.context) ? err.context.join(', ') : err.context;
					log.error(`${contextString}; ${err.message} ${JSON.stringify(req.body)}`);
				}

				if (db) {
					req.originalUrl = `{${db}}${req.originalUrl}`;
				}

				if (req.path === '/api/v0/health') {
					// Only log health-checks every 10 minutes
					if (startTime - lastHealthLog < 600000) {
						return;
					}

					lastHealthLog = startTime;
				}

				return log.info({req, res});
			}

			if (!(err instanceof BaseError)) {
				err = new InternalServerError({err});
				log.error(`${err.id}; ${JSON.stringify(req.body)}`);
				req.err = err;
			}

			return log.error({req, res, err});
		}

		res.on('finish', logResponse);
		res.on('close', logResponse);
		next();
	});
};
