// @ts-check
// Modified version of Ghost's commands file
import createDebugger from 'ghost-ignition/lib/debug.js';
import schema from './schema.js';
import {sqlite3 as sqlite} from './adapters/index.js';

const debug = createDebugger('database:commands');

/**
 * @param {import('knex').Knex.TableBuilder} columnBuilder
 * @param {string} columnName
 * @param {import('./schema.d').ColumnSchema} columnSpec
 * @param {boolean} alter
 */
export function addAbstractTableColumn(columnBuilder, columnName, columnSpec, alter = false) {
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

	if ((
		columnSpec.type === 'integer'
		|| columnSpec.type === 'tinyint'
		|| columnSpec.type === 'smallint'
		|| columnSpec.type === 'mediumint'
		|| columnSpec.type === 'bigint'
	) && columnSpec.unsigned) {
		column.unsigned();
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
export function addTableColumn(tableName, table, columnName) {
	debug('adding table column');
	return addAbstractTableColumn(table, columnName, schema[tableName][columnName]);
}

export function addColumn(tableName, column, knex) {
	return knex.schema.table(tableName, table => {
		addTableColumn(tableName, table, column);
	});
}

export function dropColumn(table, column, knex) {
	return knex.schema.table(table, table => {
		table.dropColumn(column);
	});
}

export function addUnique(table, column, knex) {
	return knex.schema.table(table, table => {
		table.unique(column);
	});
}

export function dropUnique(table, column, knex) {
	return knex.schema.table(table, table => {
		table.dropUnique(column);
	});
}

// https://github.com/tgriesser/knex/issues/1303
// createTableIfNotExists can throw error if indexes are already in place
export function createTable(table, knex) {
	return knex.schema.hasTable(table).then(exists => {
		if (exists) {
			return;
		}

		return knex.schema.createTable(table, t => {
			const columns = Object.keys(schema[table]);
			columns.forEach(column => addTableColumn(table, t, column)); // eslint-disable-line unicorn/no-array-for-each
		});
	});
}

export function deleteTable(table, knex) {
	return knex.schema.dropTableIfExists(table);
}

export function getTables(txn) {
	return sqlite.getTables(txn);
}

export function getColumns(table, txn) {
	return sqlite.getColumns(table, txn);
}

export function checkTables() {}
