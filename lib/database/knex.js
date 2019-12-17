const debug = require('ghost-ignition').debug('database:knex');
const initKnex = require('knex');
const config = require('../config');
const logging = require('../logging');

let knex;
let initOptions;

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
	const conn = txn || knex.queryBuilder();

	if (table) {
		conn.from(table);
	}

	if (db) {
		return conn.withSchema(db);
	}

	return conn;
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
