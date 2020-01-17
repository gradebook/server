// @ts-check
// Modified version of https://github.com/TryGhost/Ghost/blob/master/core/server/data/db/migrator.js
const {resolve} = require('path');
const debug = require('ghost-ignition').debug('database:migrator');
const KnexMigrator = require('knex-migrator');
const log = require('../logging');
/** @type Map<string, string> */
const hosts = require('../services/host');

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
		// @NOTE: DB_NOT_INITIALISED is not misspelled
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

module.exports.dbInit = () => migrator.init({});
module.exports.migrate = () => migrator.migrate({});
module.exports._runMigration = database => me.getState().then(state => {
	if (state === 2) {
		log.info(`Initializing database ${database || ''}`.trim());
		return me.dbInit();
	}

	if (state === 4) {
		log.info(`Migrating database ${database || ''}`.trim());
		return me.migrate();
	}
});

module.exports.startup = async () => {
	if (!hosts) {
		return me._runMigration(migrator.dbConfig.connection.database);
	}

	for (const [host, database] of hosts) {
		migrator.dbConfig.connection.database = database;
		// @NOTE: This _must_ run sequentially ~
		// eslint-disable-next-line no-await-in-loop
		await me._runMigration(database).catch(error => {
			// Since the database is not OK, the host is not healthy, so don't allow connections to it
			hosts.delete(host);
			log.error(error);
		});
	}
};

if (migrator.dbConfig.client !== 'sqlite3') {
	me.slowStart = hosts && hosts.size > 3;
}
