// @ts-check
import initKnex from 'knex';
import createDebugger from 'ghost-ignition/lib/debug.js';
import config from '../config.js';
import logging from '../logging.js';
import {ConsistencyError} from '../errors/index.js';

const debug = createDebugger('database:knex');

const initOptions = config.get('database');

debug('Initializing knex');
const _knex = initKnex(initOptions);
debug('Knex is ready');

// @todo: figure out why `this` can be lost. e.g. running `knex({db, table: 'grades', txn}).where(...).del()` fails
// because the `.from(table)` snippet seems to not be applied. The SQL becomes `delete from  where ...` and the txn
// never gets committed. That's why this function isn't that DRY
/**
 * @param {object} options
 * @param {string | undefined} [options.table]
 * @param {string | undefined} [options.db]
 * @param {import('knex').Knex.Transaction | undefined} [options.txn]
 * @property {import('knex').Knex} instance
 */
export function getKnex(options, knex = _knex) {
	if (typeof options === 'string') {
		// Log an error to include stack trace
		logging.warn(new Error('Calling knex with a table is deprecated'));
		return knex(options);
	}

	if (!options) {
		// @todo do the serialization in the knex layer
		// It seems like it's not possible / suggested right now, but it'd be
		// super cool if we could do it once knex supports it!
		return knex.queryBuilder();
	}

	const {txn, db, table} = options;

	if (typeof txn === 'string') {
		throw new ConsistencyError({code: 'TXN_NOT_TXN', statusCode: 500});
	}

	const builder = txn || knex.queryBuilder();

	if (table) {
		if (db) {
			// @ts-expect-error
			return builder.from(table).withSchema(db);
		}

		// @ts-expect-error
		return builder.from(table);
	}

	if (db) {
		return builder.withSchema(db);
	}

	return builder;
}

getKnex.instance = _knex;

export default getKnex;

export {initOptions as connectionOptions};
