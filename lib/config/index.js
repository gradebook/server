const get = require('lodash.get');
const set = require('lodash.set');
const defaults = require('./defaults.json');

let config;

try {
	config = require('../../config.js');
} catch (_) {
	config = {};
}

// @future nconf
config = Object.assign({}, defaults, config);
config.logging = Object.assign({}, defaults.logging, config.logging);
config.server = Object.assign({}, defaults.server, config.server);
config.database = Object.assign({}, defaults.database, config.database);

if (process.env.AGB_DATABASE_PATH) {
	config.database.connection.filename = process.env.AGB_DATABASE_PATH;
}

config.env = process.env.NODE_ENV || 'development';

module.exports = {
	config,
	get(key, defaultValue) {
		return get(config, key, defaultValue);
	},
	update(key, value) {
		set(config, key, value);
	}
};
