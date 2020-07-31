// Modified version of Ghost's commands file
const debug = require('ghost-ignition').debug('database:commands');
const knex = require('./knex');
const schema = require('./schema');
const {sqlite3: sqlite} = require('./adapters');

/* eslint-disable no-prototype-builtins */
function addTableColumn(tableName, table, columnName) {
	debug('adding table column');
	let column;
	const columnSpec = schema[tableName][columnName];
	const {type} = columnSpec;

	// CASE: String - has a maxLength property
	if (type === 'string') {
		column = table[type](columnName, columnSpec.maxLength);
	// CASE: Text or Integer - supports `subType` which are different sizes in MariaDB
	} else if ((type === 'text' || type === 'integer') && 'subType' in columnSpec) {
		column = table[type](columnName, columnSpec.subType);
	} else {
		column = table[type](columnName);
	}

	if (columnSpec.nullable === true) {
		column.nullable();
	} else {
		column.nullable(false);
	}

	if (columnSpec.primary === true) {
		column.primary();
	}

	if (columnSpec.unique === true) {
		column.unique();
	}

	if (columnSpec.unsigned === true) {
		column.unsigned();
	}

	if (columnSpec.hasOwnProperty('references')) {
		if (typeof columnSpec.references === 'string') {
			column.references(columnSpec.references);
		} else {
			column.references(columnSpec.references.ref);
			if (columnSpec.references.onDelete) {
				column.onDelete(columnSpec.references.onDelete);
			}
		}
	}

	if ('defaultTo' in columnSpec) {
		column.defaultTo(columnSpec.defaultTo);
	}

	if (columnSpec.index === true) {
		column.index();
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

/* eslint-enable no-prototype-builtins */
