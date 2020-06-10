// @todo: update brute-knex to not use Promise.tap
global.Promise = require('bluebird');
const express = require('express');

module.exports = async function serve() {
	try {
		// Database is not dependent on config initialized
		const {migrator, knex} = require('./database');
		const cache = require('./cache');
		const config = require('./config');
		const cron = require('./services/cron');
		const log = require('./logging');
		const clearCacheIfNeeded = require('./utils/clear-cloudflare-cache');

		const logUnhandled = (reason, error) => {
			const {InternalServerError} = require('./errors');
			log.error(new InternalServerError({
				message: '⚠ Unhandled Promise Rejection ⚠',
				err: error,
				context: reason
			}));
		};

		process.on('unhandledRejection', logUnhandled);
		process.on('uncaughtException', logUnhandled);

		let bootupServer;
		const {host, port} = config.get('server');

		if (migrator.slowStart) {
			const bootApp = express();
			bootApp.use((_, res) => res.status(503).json({error: 'Server is busy, please try again in 5 minutes.'}));
			bootupServer = bootApp.listen(port, host, () => {
				log.info(`Maintenance App listening on ${host}:${port}`);
			});
		}

		await migrator.startup();
		knex.init();
		cache.init();

		const settings = require('./services/settings');
		const ignoreUserService = require('./services/ignored-users');
		await settings.init();
		const {passport} = require('./services/authentication');
		passport.init();
		cron.init();
		await ignoreUserService.init(config, knex);

		const app = require('./web')();

		if (bootupServer) {
			await new Promise(resolve => bootupServer.close(resolve));
		}

		let server;

		await new Promise(resolve => {
			server = app.listen(port, host, () => {
				log.info(`Listening on ${host}:${port}`);
				resolve();
			});
		});

		await clearCacheIfNeeded();

		return {app, server};
	} catch (error) {
		const logging = require('./logging');
		logging.error(error);
		process.exit(100); // eslint-disable-line unicorn/no-process-exit
	}
};
