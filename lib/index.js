// @ts-check
import process from 'process';
import express from 'express';
import {migrator, knex} from './database/index.js';
import config from './config.js';
import log from './logging.js';
import {clearCacheIfNeeded} from './utils/clear-cloudflare-cache.js';

export default async function serve() {
	try {
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
		const [
			{settings},
			{default: schoolConfigService},
			{ignoredUsers},
		] = await Promise.all([
			import('./services/settings/index.js'),
			import('./services/school-config.js'),
			import('./services/ignored-users.js'),
		]);

		await Promise.all([
			settings.init(),
			schoolConfigService.init(),
			ignoredUsers.init(config, knex),
		]);

		const [
			authentication,
			schemaValidator,
			{initializeCron},
		] = await Promise.all([
			import('./services/authentication/index.js'),
			import('./services/validation/schema-validator.js'),
			import('./services/cron/index.js'),
		]);

		await schemaValidator.init();
		authentication.init();
		initializeCron();

		const {getExpress} = await import('./web/index.js');
		const app = await getExpress();

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
		log.error(error);
		process.exit(100); // eslint-disable-line unicorn/no-process-exit
	}
}
