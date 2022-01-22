// @ts-check
import createColumnMigration from '../migration-utils/column-migration.js';

const {up, down} = createColumnMigration({
	table: 'courses',
	columnName: 'settings',
	isCreation: true,
	schema: {
		type: 'json',
		fallback: '{}',
		validations: {maxLength: 10_000},
	},
});

export {up, down};
