const debug = require('ghost-ignition').debug('database:knex');
const initKnex = require('knex');
const config = require('../config');
const logging = require('../logging');

let knex;
let initOptions;

// @todo: figure out why `this` can be lost. e.g. running `knex({db, table: 'grades', txn}).where(...).del()` fails
// because the `.from(table)` snippet seems to not be applied. The SQL becomes `delete from  where ...` and the txn
// never gets committed. That's why this function isn't that DRY
function getKnex(options) {
	if (typeof options === 'string') {
		// Log an error to include stack trace
		logging.warn(new Error('Calling knex with a table is deprecated'));
		return knex(options);
	}

	if (!options) {
		return knex.queryBuilder();
	}

	const {txn, db, table} = options;

	if (table) {
		if (db) {
			return (txn || knex.queryBuilder()).from(table).withSchema(db);
		}

		return (txn || knex.queryBuilder()).from(table);
	} else if (db) {
		return (txn || knex.queryBuilder()).withSchema(db);
	}

	return txn || knex.queryBuilder();
}

function reinit() {
	if (knex) {
		knex.destroy();
	}

	initOptions = config.get('database');

	debug('Initializing knex');
	knex = initKnex(initOptions);
	debug('Knex is ready');

	module.exports = getKnex;
	module.exports.instance = knex;
	module.exports.connectionOptions = initOptions;
	module.exports.reinit = reinit;
	module.exports.init = initPool;
}

function initPool() {
	if (knex.client.pool) {
		debug('init called, pool was okay');
	} else {
		debug('initialized pool');
		knex.client.initializePool({});
	}
}

reinit();
