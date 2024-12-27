// @ts-check
import {MAX_CREDITS_IN_COURSE} from '../../services/validation/schema-loader.js';
import createAlterColumn from '../migration-utils/alter-column.js';

const {up, down} = createAlterColumn({
	table: 'courses',
	columnName: 'credit_hours',
	previousSchema: {
		type: 'tinyint', nullable: false, unsigned: true, validations: {between: [0, MAX_CREDITS_IN_COURSE]},
	},
	currentSchema: {type: 'float', nullable: false, validations: {between: [0, MAX_CREDITS_IN_COURSE]}},
	context: 'Convert course credit hours column to float',
}, true);

export {up, down};
