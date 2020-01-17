const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_SCHEMAS = [{
	name: 'cut1Name',
	default: 'A'
}, {
	name: 'cut2Name',
	default: 'B'
}, {
	name: 'cut3Name',
	default: 'C'
}, {
	name: 'cut4Name',
	default: 'D'
}];

exports.up = ({transacting: connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		for (const {name, default: fallback} of COLUMN_SCHEMAS) {
			table.string(name).notNull().defaultTo(fallback);
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
