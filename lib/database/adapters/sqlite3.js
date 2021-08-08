// Modified version of https://github.com/TryGhost/Ghost/blob/master/core/server/data/schema/clients/sqlite3.js
const knex = require('../knex');

function queryRaw(query, txn, cb) {
	if (!cb) {
		cb = txn;
		txn = null;
	}

	return knex({txn}).raw(query).then(response => cb(response));
}

function getTables(txn) {
	return queryRaw(
		'select * from sqlite_master where type = "table"',
		txn,
		response => response.map(table => table.tbl_name).filter(name => name !== 'sqlite_sequence'),
	);
}

function getColumns(table, txn) {
	return queryRaw(`'pragma table_info("${table}")`,
		txn,
		response => response.flatMap(idx => idx.name),
	);
}

module.exports = {
	getTables,
	getColumns,
};
