// @ts-check
import createDebugger from 'ghost-ignition/lib/debug.js';
import knexFile from '../../knexfile.js';
import {BaseError} from '../errors/index.js';
import log from '../logging.js';
import {hostMap} from '../services/host.js';
import config from '../config.js';
import knex from './knex.js';

const debug = createDebugger('migrations');
const migrationConfig = knexFile[config.get('env')].migrations;

/**
 * @param {string} database
 * @returns {Promise<void>}
 */
async function _checkDatabaseState(database) {
	const prefix = database ? `[${database}] ` : '';

	debug(`${prefix}Determining required migrations`);
	const [, missingMigrations] = await knex.instance.migrate.list({
		...migrationConfig,
		schemaName: database,
	});

	debug(`${prefix}Missing ${missingMigrations.length} migrations`);
	if (missingMigrations.length > 0) {
		// @todo add types to Ghost Ignition
		// @ts-ignore
		throw new BaseError({
			message: 'There are some missing migrations. Run them first',
		});
	}
}

export const slowStart = knex.instance.client.client !== 'sqlite3' && hostMap && hostMap.size > 3;

export async function init() {
	if (!hostMap) {
		return _checkDatabaseState(null);
	}

	const validations = [];

	for (const [host, database] of hostMap) {
		// eslint-disable-next-line promise/prefer-await-to-then
		validations.push(_checkDatabaseState(database).catch(error => {
			// Since the database is not OK, the host is not healthy, so don't allow connections to it
			hostMap.delete(host);
			log.error(error);
		}));
	}

	await Promise.all(validations);

	if (hostMap.size === 0) {
		// @ts-ignore
		throw new BaseError({
			message: 'No valid hosts found',
		});
	}
}
