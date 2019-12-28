const config = require('../config');
let store;

if (config.get('redis') === true) {
	const Store = require('@gradebook/express-brute-redis');
	store = new Store({
		client: require('../database/redis'),
		prefix: 'brute:'
	});
} else {
	const Store = require('brute-knex');
	const {knex: {instance: knex}} = require('../../database');
	store = new Store({
		tablename: 'brute',
		createTable: false,
		knex
	});
}

module.exports = store;
