// @ts-check
const debug = require('ghost-ignition').debug('migrations');
const {BaseError} = require('../errors');
const log = require('../logging');
/** @type Map<string, string> */
const hosts = require('../services/host');
const config = require('../config');
const migrationConfig = require('../../knexfile')[config.get('env')].migrations;
const knex = require('./knex');

/**
 * @param {string} database
 * @returns {Promise<void>}
 */
async function _runNecessaryMigrations(database) {
	const prefix = database ? `[${database}] ` : '';

	debug(`${prefix}Determining required migrations`);
	const [, missingMigrations] = await knex.instance.migrate.list({
		...migrationConfig,
		schemaName: database
	});

	debug(`${prefix}Missing ${missingMigrations.length} migrations`);
	if (missingMigrations.length > 0) {
		// @todo add types to Ghost Ignition
		// @ts-ignore
		throw new BaseError({
			message: 'There are some missing migrations. Run them first'
		});
	}
}

module.exports.slowStart = knex.instance.client.client !== 'sqlite3' && hosts && hosts.size > 3;

module.exports.init = async () => {
	if (!hosts) {
		return _runNecessaryMigrations(null);
	}

	const validations = [];

	for (const [host, database] of hosts) {
		validations.push(_runNecessaryMigrations(database).catch(error => {
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
