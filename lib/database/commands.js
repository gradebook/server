// @ts-check
// Modified version of Ghost's commands file
const debug = require('ghost-ignition').debug('database:commands');
const schema = require('./schema');
const {sqlite3: sqlite} = require('./adapters');

/**
 * @param {import('knex').Knex.TableBuilder} columnBuilder
 * @param {string} columnName
 * @param {import('./schema.d').ColumnSchema} columnSpec
 * @param {boolean} alter
 */
function addAbstractTableColumn(columnBuilder, columnName, columnSpec, alter = false) {
	/** @type {import('knex').Knex.ColumnBuilder} */
	let column;

	// CASE: String - has a maxLength property
	if (columnSpec.type === 'string') {
		column = columnBuilder[columnSpec.type](columnName, columnSpec.maxLength);
	// CASE: Text - Has multiple subtypes
	} else if (columnSpec.type === 'text' && 'subType' in columnSpec) {
		column = columnBuilder[columnSpec.type](columnName, columnSpec.subType);
	} else {
		column = columnBuilder[columnSpec.type](columnName);
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

	if (alter === true) {
		column.alter();
	}

	if ('references' in columnSpec) {
		column.references(columnSpec.references);
	}

	if ('fallback' in columnSpec) {
		column.defaultTo(columnSpec.fallback);
	}
}

/**
 * @param {string} tableName
 * @param {import('knex').Knex.TableBuilder} table
 * @param {string} columnName
 */
function addTableColumn(tableName, table, columnName) {
	debug('adding table column');
	return addAbstractTableColumn(table, columnName, schema[tableName][columnName]);
}

function addColumn(tableName, column, knex) {
	return knex.schema.table(tableName, table => {
		addTableColumn(tableName, table, column);
	});
}

function dropColumn(table, column, knex) {
	return knex.schema.table(table, table => {
		table.dropColumn(column);
	});
}

function addUnique(table, column, knex) {
	return knex.schema.table(table, table => {
		table.unique(column);
	});
}

function dropUnique(table, column, knex) {
	return knex.schema.table(table, table => {
		table.dropUnique(column);
	});
}

// https://github.com/tgriesser/knex/issues/1303
// createTableIfNotExists can throw error if indexes are already in place
function createTable(table, knex) {
	return knex.schema.hasTable(table).then(exists => {
		if (exists) {
			return;
		}

		return knex.schema.createTable(table, t => {
			const columns = Object.keys(schema[table]);
			columns.forEach(column => addTableColumn(table, t, column));
		});
	});
}

function deleteTable(table, knex) {
	return knex.schema.dropTableIfExists(table);
}

function getTables(txn) {
	return sqlite.getTables(txn);
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
	addUnique,
	dropUnique,
	addColumn,
	dropColumn,
	getColumns,
	addAbstractTableColumn
};
