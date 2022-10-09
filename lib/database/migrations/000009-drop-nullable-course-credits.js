// @ts-check
import {MAX_CREDITS_IN_COURSE} from '../../services/validation/schema-loader.js';
import createAlterColumnMigration from '../migration-utils/alter-column.js';

/** @type {import('../schema.d').ColumnSchema} */
const WITH_NULLABLE_SCHEMA = {
	type: 'tinyint', nullable: true, fallback: null, unsigned: true, validations: {between: [0, MAX_CREDITS_IN_COURSE]},
};

/** @type {import('../schema.d').ColumnSchema} */
const WITHOUT_NULLABLE_SCHEMA = {
	type: 'tinyint', nullable: false, unsigned: true, validations: {between: [0, MAX_CREDITS_IN_COURSE]},
};

const {up, down} = createAlterColumnMigration({
	table: 'courses',
	columnName: 'credit_hours',
	context: 'nullable',
	previousSchema: WITH_NULLABLE_SCHEMA,
	currentSchema: WITHOUT_NULLABLE_SCHEMA,
});

export {up, down};
