// @ts-check
import createAlterColumn from '../migration-utils/alter-column.js';

const {up, down} = createAlterColumn({
	table: 'grades',
	columnName: 'name',
	previousSchema: {type: 'string', maxLength: 50, nullable: true},
	currentSchema: {type: 'string', maxLength: 55, nullable: true},
	context: 'Increase max length of grade name',
});

export {up, down};
