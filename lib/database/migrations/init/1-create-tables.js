const Promise = require('bluebird');
const {createTable} = require('../../commands');
const schema = require('../../schema');
const logging = require('../../../logging');

const schemaTables = Object.keys(schema);

function createTables({connection}) {
	return Promise.mapSeries(schemaTables, function createSingleTable(table) {
		logging.info(`Creating table: ${table}`);
		return createTable(table, connection);
	});
}

module.exports.up = createTables;
