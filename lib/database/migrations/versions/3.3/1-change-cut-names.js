const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_CHANGES = [
	['cutA', 'cut1'],
	['cutB', 'cut2'],
	['cutC', 'cut3'],
	['cutD', 'cut4']
];

exports.up = ({transacting: connection}) => {
	return connection.schema.alterTable(TABLE_NAME, async table => {
		for (const [from, to] of COLUMN_CHANGES) {
			table.renameColumn(from, to);
			log.info(`Renamed ${TABLE_NAME}.${from} to ${TABLE_NAME}.${to}`);
		}
	});
};

exports.down = ({transacting: connection}) => {
	return connection.schema.alterTable(TABLE_NAME, table => {
		for (const [to, from] of COLUMN_CHANGES) {
			table.renameColumn(from, to);
			log.info(`Renamed ${TABLE_NAME}.${from} to ${TABLE_NAME}.${to}`);
		}
	});
};

exports.config = {
	transaction: true
};
