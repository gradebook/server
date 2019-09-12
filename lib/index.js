// @todo: update brute-knex to not use Promise.tap
global.Promise = require('bluebird');

module.exports = async function serve() {
	// Database is not dependent on config initialized
	const {migrator, knex} = require('./database');
	const cache = require('./cache');
	const config = require('./config');
	const cron = require('./services/cron');
	const log = require('./logging');

	await migrator.startup();
	knex.init();
	await cache.init();
	const {passport} = require('./services/authentication');
	passport.init();
	cron.init();

	const app = require('./web')();
	const {host, port} = config.get('server');

	const server = app.listen(port, host, () => {
		log.info(`Listening on ${host}:${port}`);
	});

	return {app, server};
};
