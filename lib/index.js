// @ts-check
const express = require('express');

module.exports = async function serve() {
	try {
		// Database is not dependent on config initialized
		const {migrator, knex} = require('./database');
		const config = require('./config');
		const cron = require('./services/cron');
		const log = require('./logging');
		const clearCacheIfNeeded = require('./utils/clear-cloudflare-cache');

		let bootupServer;
		const {host, port} = config.get('server');

		if (migrator.slowStart) {
			const bootApp = express();
			bootApp.use((_, response) => response.status(503).json({error: 'Server is busy, please try again in 5 minutes.'}));
			bootupServer = bootApp.listen(port, host, () => {
				log.info(`Maintenance App listening on ${host}:${port}`);
			});
		}

		await migrator.init();

		const settings = require('./services/settings');
		const schoolConfigService = require('./services/school-config');
		const ignoreUserService = require('./services/ignored-users');
		const {passport} = require('./services/authentication');

		await Promise.all([
			settings.init(),
			schoolConfigService.init(),
			ignoreUserService.init(config, knex),
		]);

		passport.init();
		cron.init();

		const app = require('./web')();

		if (bootupServer) {
			await new Promise(resolve => {
				bootupServer.close(resolve);
			});
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
