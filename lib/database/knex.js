// @ts-check
const debug = require('ghost-ignition').debug('database:knex');
const {knex: initKnex} = require('knex');
const config = require('../config');
const logging = require('../logging');
const {ConsistencyError} = require('../errors');

const initOptions = config.get('database');

debug('Initializing knex');
const knex = initKnex(initOptions);
debug('Knex is ready');

// @todo: figure out why `this` can be lost. e.g. running `knex({db, table: 'grades', txn}).where(...).del()` fails
// because the `.from(table)` snippet seems to not be applied. The SQL becomes `delete from  where ...` and the txn
// never gets committed. That's why this function isn't that DRY
/**
 * @param {object} options
 * @param {string} options.table
 * @param {string} [options.db]
 * @param {import('knex').Knex.Transaction} [options.txn]
 */
module.exports = function getKnex(options) {
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
			// @ts-ignore
			return builder.from(table).withSchema(db);
		}

		// @ts-ignore
		return builder.from(table);
	}

	if (db) {
		return builder.withSchema(db);
	}

	return builder;
};

module.exports.instance = knex;
module.exports.connectionOptions = initOptions;
