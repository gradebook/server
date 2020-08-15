// @ts-check
const session = require('express-session');
const config = require('../config');

/** @type {import('connect-redis').RedisStore | import('connect-session-knex').StoreFactory} */
let Store;
/** @type {import('connect-redis').RedisStoreOptions | import('connect-session-knex').ConfigType} */
let storeOpts;

if (String(config.get('redis')) === 'true') {
	Store = require('connect-redis')(session);

	storeOpts = {
		prefix: 'sessionAGB',
		client: require('../database/redis')
	};
} else {
	// Typings are incorrect! Does not export a `default` object
	// @ts-ignore
	Store = require('connect-session-knex')(session);
	const {knex: {instance: knex}} = require('../database');

	storeOpts = {
		knex,
		createTable: false,
		sidfieldname: 'sessionAGB',
		// Clear expired sessions every week
		clearInterval: 1000 * 60 * 60 * 24 * 7
	};
}

module.exports = new Store(storeOpts);
