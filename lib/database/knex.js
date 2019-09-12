const debug = require('debug')('agb:database:knex');
const initKnex = require('knex');
const config = require('../config');

let knex;
let initOptions;

function reinit() {
	if (knex) {
		knex.destroy();
	}

	initOptions = config.get('database');

	debug('Initializing knex');
	knex = initKnex(initOptions);
	debug('Knex is ready');

	module.exports = knex;
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
