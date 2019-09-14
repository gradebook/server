// Modified version of https://github.com/TryGhost/Ghost/blob/master/core/server/data/db/migrator.js
const {resolve} = require('path');
const debug = require('ghost-ignition').debug('database:migrator');
const KnexMigrator = require('knex-migrator');
const log = require('../logging');

const migrator = new KnexMigrator({
	migratorFilePath: resolve(__dirname, '../../')
});

const me = module.exports;

module.exports.getState = () => {
	let state;

	debug('Getting database state');
	return migrator.isDatabaseOK().then(() => {
		debug('Database is ready');
		state = 1;
		return state;
	}).catch(error => {
		const {code} = error;
		// CASE: database was never created
		if (code === 'DB_NOT_INITIALISED' || code === 'MIGRATION_TABLE_IS_MISSING') {
			debug('Database needs to be initialized');
			state = 2;
			return state;
		}

		// CASE: database needs migrations
		if (code === 'DB_NEEDS_MIGRATION') {
			state = 4;
			return state;
		}

		// CASE: database connection errors, unknown cases
		throw error;
	});
};

module.exports.dbInit = () => migrator.init();
module.exports.migrate = () => migrator.migrate();

module.exports.startup = () => me.getState().then(state => {
	if (state === 2) {
		log.info('initializing database');
		return me.dbInit();
	}

	if (state === 4) {
		log.info('migrating database');
		return me.migrate();
	}
});
