const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_SCHEMAS = [{
	name: 'cut1Name',
	default: 'A',
	maxLength: 5
}, {
	name: 'cut2Name',
	default: 'B',
	maxLength: 5
}, {
	name: 'cut3Name',
	default: 'C',
	maxLength: 5
}, {
	name: 'cut4Name',
	default: 'D',
	maxLength: 5
}];

exports.up = ({transacting: connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		for (const {name, maxLength, default: fallback} of changes) {
			table.string(name, maxLength).notNull().defaultTo(fallback);
			log.info(`Added ${TABLE_NAME}.${name}`);
		}
	});
};

exports.down = ({transacting: connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		for (const {name} of COLUMN_SCHEMAS) {
			table.dropColumn(name);
			log.info(`Removed ${TABLE_NAME}.${name}`);
		}
	});
};

exports.config = {
	transaction: true
};
