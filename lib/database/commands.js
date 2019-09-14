// Modified version of Ghost's commands file
const debug = require('ghost-ignition').debug('database:commands');
const conn = require('./knex');
const schema = require('./schema');
const {sqlite3: sqlite} = require('./adapters');

/* eslint-disable no-prototype-builtins */
function addTableColumn(tableName, table, columnName) {
	debug('adding table column');
	let column;
	const columnSpec = schema[tableName][columnName];

	if (columnSpec.type === 'string') {
		const length = columnSpec.hasOwnProperty('maxLength') ? columnSpec.maxLength : 191;
		column = table[columnSpec.type](columnName, length);
	} else {
		column = table[columnSpec.type](columnName);
	}

	if (columnSpec.hasOwnProperty('nullable') && columnSpec.nullable === true) {
		column.nullable();
	} else {
		column.nullable(false);
	}

	if (columnSpec.hasOwnProperty('primary') && columnSpec.primary === true) {
		column.primary();
	}

	if (columnSpec.hasOwnProperty('unique') && columnSpec.unique) {
		column.unique();
	}

	if (columnSpec.hasOwnProperty('unsigned') && columnSpec.unsigned) {
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

	if (columnSpec.hasOwnProperty('defaultTo')) {
		column.defaultTo(columnSpec.defaultTo);
	}

	if (columnSpec.hasOwnProperty('index') && columnSpec.index === true) {
		column.index();
	}
}

function addColumn(tableName, column, txn) {
	return (txn || conn).schema.table(tableName, table => {
		addTableColumn(tableName, table, column);
	});
}

function dropColumn(table, column, txn) {
	return (txn || conn).schema.table(table, table => {
		table.dropColumn(column);
	});
}

function addUnique(table, column, txn) {
	return (txn || conn).schema.table(table, table => {
		table.unique(column);
	});
}

function dropUnique(table, column, txn) {
	return (txn || conn).schema.table(table, table => {
		table.dropUnique(column);
	});
}

// https://github.com/tgriesser/knex/issues/1303
// createTableIfNotExists can throw error if indexes are already in place
function createTable(table, txn) {
	const transaction = txn || conn;
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
	return (txn || conn).schema.dropTableIfExists(table);
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
