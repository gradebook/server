// @ts-check
const {BaseError} = require('../errors');
const log = require('../logging');
/** @type Map<string, string> */
const hosts = require('../services/host');
const knex = require('./knex');

const LATEST_MIGRATION = '';

/**
 * @param {string} database
 * @returns {Promise<true>}
 */
async function _verifyMigrations(database) {
	const prefix = database ? `${database} Database` : 'Database';

	try {
		// We can't use knex.columnInfo() because it doesn't respect .withSchema()
		const {name: lastMigration} = await knex({table: 'migrations', db: database})
			.select('name', 'batch')
			.orderBy('id', 'desc')
			.first();

		if (lastMigration !== LATEST_MIGRATION) {
			// @ts-ignore
			throw new BaseError({
				message: `${prefix} is not on the latest migration.`,
				context: `Database version: ${lastMigration}; Latest version: ${LATEST_MIGRATION}`,
				help: 'Ensure you have run all required knex migrations'
			});
		}
	} catch (error) {
		// SQLITE No Table
		const isKnownError = error.message.match(/SQLITE_ERROR: no such table/i) ||
			// MySQL No Table
			error.code === 'ER_NO_SUCH_TABLE' ||
			// SQLITE Old Migrations Table
			error.message.match(/SQLITE_ERROR: no such column/i) ||
			// MySQL Old Migrations Table
			error.code === 'ER_BAD_FIELD_ERROR';

		if (isKnownError) {
			// @todo: create a PR to Ghost-Ignition and convert error class to ES6
			// @ts-ignore
			throw new BaseError({
				message: `${prefix} does not have a valid migrations table`,
				context: 'Either the migrations table does not exist, or it is using the deprecated knex-migrator schema',
				help: 'Ensure you have run all required knex migrations'
			});
		}

		throw error;
	}

	return true;
}

module.exports.slowStart = knex.instance.client.client !== 'sqlite3' && hosts && hosts.size > 3;

module.exports.init = async () => {
	if (!hosts) {
		return _verifyMigrations(null);
	}

	const validations = [];

	for (const [host, database] of hosts) {
		validations.push(_verifyMigrations(database).catch(error => {
			// Since the database is not OK, the host is not healthy, so don't allow connections to it
			hosts.delete(host);
			log.error(error);
		}));
	}

	await Promise.all(validations);

	if (hosts.size === 0) {
		// @ts-ignore
		throw new BaseError({
			message: 'No valid hosts found'
		});
	}
};
