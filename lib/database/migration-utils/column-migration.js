// @ts-check
const logging = require('../../logging');
const {addAbstractTableColumn, dropColumn} = require('../commands');

/**
 * @param {object} config
 * @param {'users' | 'courses' | 'categories' | 'grades' | 'sessions' | 'settings' | 'actions' | 'statistics'
 * } config.table
 * @param {string} config.columnName
 * @param {boolean} config.isCreation
 * @param {import('../schema.d').ColumnSchema} config.schema
 */
module.exports = function createColumnMigration({table, columnName, isCreation, schema}) {
	/** @param {import('knex')} knex */
	const creationMigration = async knex => {
		const columnExists = await knex.schema.hasColumn(table, columnName);

		if (columnExists) {
			logging.warn(`Column already exists: ${table}.${columnName}`);
			return;
		}

		logging.info(`Adding Column: ${table}.${columnName}`);
		await knex.schema.table(table, tableBuilder => {
			addAbstractTableColumn(tableBuilder, columnName, schema);
		});
	};

	/** @param {import('knex')} knex */
	const deletionMigration = async knex => {
		const hasColumn = await knex.schema.hasColumn(table, columnName);
		if (hasColumn) {
			logging.info(`Dropping Column: ${table}.${columnName}`);
			return dropColumn(table, columnName, knex);
		}

		logging.warn(`Column already gone: ${table}.${columnName}`);
	};

	if (isCreation) {
		return {
			up: creationMigration,
			down: deletionMigration
		};
	}

	return {
		up: deletionMigration,
		down: createColumnMigration
	};
};
