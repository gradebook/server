// @ts-check
import createColumnMigration from '../migration-utils/column-migration.js';

export default createColumnMigration({
	table: 'users',
	columnName: 'donated_at',
	isCreation: true,
	schema: {
		type: 'datetime',
		nullable: true,
		fallback: null,
	},
});
