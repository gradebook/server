// @ts-check
const createColumnMigration = require('../migration-utils/column-migration');

module.exports = createColumnMigration({
	table: 'users',
	columnName: 'total_school_changes',
	isCreation: true,
	schema: {
		nullable: true,
		type: 'tinyint',
		unsigned: true,
		fallback: 0,
		validations: {
			between: [0, 5],
		},
	},
});
