const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_CHANGES = [
	{from: 'cutA', to: 'cut1'},
	{from: 'cutB', to: 'cut2'},
	{from: 'cutC', to: 'cut3'},
	{from: 'cutD', to: 'cut4'}
];

async function renameMulti(txn, changes) {
	return txn.schema.alterTable(TABLE_NAME, async table => {
		for (const {from, to} of changes) {
			log.info(`Renamed ${TABLE_NAME}.${from} to ${TABLE_NAME}.${to}`);
			table.renameColumn(from, to);
		}
	});
}

exports.up = async ({transacting: connection}) => {
	const changes = [];

	for (const item of COLUMN_CHANGES) {
		// eslint-disable-next-line no-await-in-loop
		const shouldMigrate = await connection.schema.hasColumn(TABLE_NAME, item.from);

		if (shouldMigrate) {
			changes.push(item);
		} else {
			log.warn(`Renamed ${TABLE_NAME}.${item.from} to ${TABLE_NAME}.${item.to}`);
		}
	}

	return renameMulti(connection, changes);
};

exports.down = async ({transacting: connection}) => {
	const changes = [];

	for (const item of COLUMN_CHANGES) {
		// eslint-disable-next-line no-await-in-loop
		const shouldMigrate = await connection.schema.hasColumn(TABLE_NAME, item.to);

		if (shouldMigrate) {
			changes.push({from: item.to, to: item.from});
		} else {
			log.warn(`Renamed ${TABLE_NAME}.${item.to} to ${TABLE_NAME}.${item.from}`);
		}
	}

	return renameMulti(connection, changes);
};

exports.config = {
	transaction: true
};
