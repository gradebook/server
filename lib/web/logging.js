// @ts-check
import process from 'process';
import log from '../logging.js';
import {BaseError, InternalServerError} from '../errors/index.js';

let lastHealthLog = 0;

export function useLogging(app) {
	if (process.env.NODE_ENV === 'testing') {
		return;
	}

	app.use(function logRequest(request, response, next) {
		const startTime = Date.now();

		function logResponse() {
			let {err, _table: db} = request;
			response.responseTime = `${Date.now() - startTime}ms`;

			response.removeListener('finish', logResponse);
			response.removeListener('close', logResponse);

			/**
			 * Don't error log
			 *  1. Requests without errors
			 *  2. 404 (Not Found) errors
			 *  3. Validation Errors
			 *  4. Precondition Failed Errors
			 */
			if (!err || err.statusCode === 404 || err.statusCode === 422 || err.statusCode === 412) {
				if (err && err.statusCode === 422) {
					let contextString = Array.isArray(err.context) ? err.context.join(', ') : err.context;
					contextString = contextString ? `${contextString}; ` : '';
					const controller = err.$controller ? `\n  Controller: ${err.$controller}` : '';
					const body = `\n  Body: ${JSON.stringify(request.body)}`;
					log.error(`${contextString}${err}${controller}${body}`);
				}

				if (db) {
					request.originalUrl = `{${db}}${request.originalUrl}`;
				}

				if (request.path === '/api/v0/health') {
					// Only log health-checks every 10 minutes
					if (startTime - lastHealthLog < 600_000) {
						return;
					}

					lastHealthLog = startTime;
				}

				return log.info({req: request, res: response});
			}

			if (!(err instanceof BaseError)) {
				err = new InternalServerError({err});
				log.error(`${err.id}; ${JSON.stringify(request.body)}`);
				request.err = err;
			}

			return log.error({req: request, res: response, err});
		}

		response.on('finish', logResponse);
		response.on('close', logResponse);
		next();
	});
}
