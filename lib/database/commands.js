// @ts-check
// Modified version of Ghost's commands file
const debug = require('ghost-ignition').debug('database:commands');
const knex = require('./knex');
const schema = require('./schema');
const {sqlite3: sqlite} = require('./adapters');

/**
 * @param {string} tableName
 * @param {import('knex').TableBuilder} table
 * @param {string} columnName
 */
function addTableColumn(tableName, table, columnName) {
	debug('adding table column');
	/** @type {import('knex').ColumnBuilder} */
	let column;
	/** @type {import('./schema.d').ColumnSchema} */
	const columnSpec = schema[tableName][columnName];

	// CASE: String - has a maxLength property
	if (columnSpec.type === 'string') {
		column = table[columnSpec.type](columnName, columnSpec.maxLength);
	// CASE: Text - Has multiple subtypes
	} else if (columnSpec.type === 'text' && 'subType' in columnSpec) {
		column = table[columnSpec.type](columnName, columnSpec.subType);
	} else {
		column = table[columnSpec.type](columnName);
	}

	if (
		columnSpec.type === 'integer' ||
		columnSpec.type === 'tinyint' ||
		columnSpec.type === 'smallint' ||
		columnSpec.type === 'mediumint' ||
		columnSpec.type === 'bigint'
	) {
		if (columnSpec.unsigned) {
			column.unsigned();
		}
	}

	if (columnSpec.nullable === true) {
		column.nullable();
	} else {
		column.notNullable();
	}

	if (columnSpec.primary === true) {
		column.primary();
	}

	if (columnSpec.unique === true) {
		column.unique();
	}

	if (columnSpec.index === true) {
		column.index();
	}

	if ('references' in columnSpec) {
		column.references(columnSpec.references);
	}

	if ('fallback' in columnSpec) {
		column.defaultTo(columnSpec.fallback);
	}
}

function addColumn(tableName, column, txn) {
	return knex({txn}).schema.table(tableName, table => {
		addTableColumn(tableName, table, column);
	});
}

function dropColumn(table, column, txn) {
	return knex({txn}).schema.table(table, table => {
		table.dropColumn(column);
	});
}

function addUnique(table, column, txn) {
	return knex({txn}).schema.table(table, table => {
		table.unique(column);
	});
}

function dropUnique(table, column, txn) {
	return knex({txn}).schema.table(table, table => {
		table.dropUnique(column);
	});
}

// https://github.com/tgriesser/knex/issues/1303
// createTableIfNotExists can throw error if indexes are already in place
function createTable(table, txn) {
	const transaction = knex({txn});
	return transaction.schema.hasTable(table).then(exists => {
		if (exists) {
			return;
		}

		return transaction.schema.createTable(table, t => {
			const columns = Object.keys(schema[table]);
			columns.forEach(column => addTableColumn(table, t, column));
		});
	});
}

function deleteTable(table, txn) {
	return knex({txn}).schema.dropTableIfExists(table);
}

function getTables(txn) {
	return sqlite.getTables(txn);
}

function getIndexes(table, txn) {
	return sqlite.getIndexes(table, txn);
}

function getColumns(table, txn) {
	return sqlite.getColumns(table, txn);
}

function checkTables() {}

module.exports = {
	checkTables,
	createTable,
	deleteTable,
	getTables,
	getIndexes,
	addUnique,
	dropUnique,
	addColumn,
	dropColumn,
	getColumns
};
