// @ts-check
const Promise = require('bluebird');
const {createTable} = require('../commands');
const schema = require('../schema');
const logging = require('../../logging');

const schemaTables = Object.keys(schema);

function createTables(knex) {
	return Promise.mapSeries(schemaTables, function createSingleTable(table) {
		logging.info(`Creating table: ${table}`);
		return createTable(table, knex);
	});
}

module.exports.up = createTables;

module.exports.down = () => true;
