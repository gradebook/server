// @ts-check
const log = require('../../../../logging');

const TABLE_NAME = 'brute';

/**
 * @param {{connection: import('knex')}} config
 */
exports.up = async ({connection}) => {
	const shouldMigrate = await connection.schema.hasTable(TABLE_NAME);

	if (!shouldMigrate) {
		log.warn(`Dropped ${TABLE_NAME}`);
		return;
	}

	return connection.schema.dropTable(TABLE_NAME);
};

/**
 * @param {{connection: import('knex')}} config
 */
exports.down = async ({connection}) => {
	const shouldMigrate = !(await connection.schema.hasTable(TABLE_NAME));

	if (!shouldMigrate) {
		log.warn(`Added ${TABLE_NAME}`);
		return;
	}

	return connection.schema.createTable(TABLE_NAME, table => {
		table.string('key', 191).primary();
		table.bigInteger('firstRequest');
		table.bigInteger('lastRequest');
		table.bigInteger('lifetime');
		table.integer('count');
	});
};
