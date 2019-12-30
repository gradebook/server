// @ts-check
const session = require('express-session');
const config = require('../config');

module.exports = function getSessionStore() {
	let Store;
	let storeOpts;

	if (String(config.get('redis')) === 'true') {
		Store = require('connect-redis')(session);

		storeOpts = {
			prefix: 'sessionAGB',
			client: require('../database/redis')
		};
	} else {
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

	return new Store(storeOpts);
};