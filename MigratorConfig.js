/* eslint-disable unicorn/filename-case */
const {resolve} = require('path');
const knex = require('./lib/database/knex.js');
const {version} = require('./package.json');

module.exports = {
	currentVersion: version.split('.').slice(0, 2).join('.'),
	database: knex.connectionOptions,
	migrationPath: resolve(__dirname, './lib/database/migrations')
};

/* eslint-enable unicorn/filename-case */
