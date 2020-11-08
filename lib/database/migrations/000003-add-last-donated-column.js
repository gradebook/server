// @ts-check
const createColumnMigration = require('../migration-utils/column-migration');

module.exports = createColumnMigration({
	table: 'users',
	columnName: 'donated_at',
	isCreation: true,
	schema: {
		type: 'datetime',
		nullable: true,
		fallback: null
	}
});
