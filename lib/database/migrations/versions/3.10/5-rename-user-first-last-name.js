const logging = require('../../../../logging');

const TABLE_NAME = 'users';
const COLUMN_NAMES = [{
	from: 'firstName',
	to: 'first_name'
}, {
	from: 'lastName',
	to: 'last_name'
}];

/**
* @param {import('knex').Transaction} txn
* @param {{from: string, to: string}[]} changes
*/
async function renameColumn(connection, from, to) {
	const hasColumn = await connection.schema.hasColumn(TABLE_NAME, from);

	if (!hasColumn) {
		logging.warn(`Renamed ${TABLE_NAME}.${from} to ${TABLE_NAME}.${to}`);
		return;
	}

	await connection.schema.alterTable(TABLE_NAME, table => {
		table.renameColumn(from, to);
	});

	logging.info(`Renamed ${TABLE_NAME}.${from} to ${TABLE_NAME}.${to}`);
}

/**
 * @param {object} config
 * @param {import('knex').Transaction} config.transacting
 */
exports.up = async ({transacting: connection}) => {
	for (const {from, to} of COLUMN_NAMES) {
		await renameColumn(connection, from, to); // eslint-disable-line no-await-in-loop
	}
};

/**
 * @param {object} config
 * @param {import('knex').Transaction} config.transacting
 */
exports.down = async ({transacting: connection}) => {
	for (const {from, to} of COLUMN_NAMES) {
		await renameColumn(connection, to, from); // eslint-disable-line no-await-in-loop
	}
};

exports.config = {
	transaction: true
};
