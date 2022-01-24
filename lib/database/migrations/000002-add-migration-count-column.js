// @ts-check
import createColumnMigration from '../migration-utils/column-migration.js';

const {up, down} = createColumnMigration({
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

export {up, down};
