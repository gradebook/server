// @ts-check
const createColumnMigration = require('../migration-utils/column-migration');

module.exports = createColumnMigration({
	table: 'courses',
	columnName: 'settings',
	isCreation: true,
	schema: {
		type: 'json',
		fallback: '{}',
		validations: {maxLength: 10_000},
	},
});
