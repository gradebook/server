// @ts-check
const logging = require('../../logging');
const {addAbstractTableColumn} = require('../commands');

/**
 * @param {object} config
 * @param {'users' | 'courses' | 'categories' | 'grades' | 'sessions' | 'settings' | 'actions' | 'statistics'
 * } config.table
 * @param {string} config.columnName
 * @param {boolean} config.isCreation
 * @param {string} config.context
 * @param {import('../schema.d').ColumnSchema} config.previousSchema
 * @param {import('../schema.d').ColumnSchema} config.currentSchema
 */
module.exports = function createAlterColumnMigration({table, columnName, previousSchema, currentSchema, context}) {
	/**
	 * @param {import('../schema.d').ColumnSchema} schema
	 * @returns {(knex: import('knex')) => Promise<void>}
	 */
	const wrap = schema => {
		return async knex => {
			if (knex.client.config.client === 'sqlite3') {
				logging.info(`Not updating Column: ${table}.${columnName} (${context}) - sqlite is not supported`);
				return;
			}

			const columnExists = await knex.schema.hasColumn(table, columnName);

			if (columnExists) {
				logging.info(`Updating Column: ${table}.${columnName} (${context})`);
			} else {
				logging.info(`Unexpectedly Creating Column: ${table}.${columnName} (${context})`);
			}

			await knex.schema.table(table, tableBuilder => {
				addAbstractTableColumn(tableBuilder, columnName, schema, columnExists);
			});
		};
	};

	return {
		up: wrap(currentSchema),
		down: wrap(previousSchema)
	};
};
