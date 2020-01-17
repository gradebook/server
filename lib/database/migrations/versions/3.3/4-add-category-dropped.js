const log = require('../../../../logging');

const TABLE_NAME = 'categories';
const COLUMN_NAME = 'dropped_grades';

exports.up = async ({connection}) => {
	const shouldMigrate = !(await connection.schema.hasColumn(TABLE_NAME, COLUMN_NAME));

	if (!shouldMigrate) {
		log.warn(`Added ${TABLE_NAME}.${COLUMN_NAME}`);
		return;
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		table.specificType(COLUMN_NAME, 'tinyint').unsigned().nullable().defaultTo(null);
		log.info(`Added ${TABLE_NAME}.${COLUMN_NAME}`);
	});
};

exports.down = async ({connection}) => {
	const shouldMigrate = await connection.schema.hasColumn(TABLE_NAME, COLUMN_NAME);

	if (!shouldMigrate) {
		log.warn(`Dropped ${TABLE_NAME}.${COLUMN_NAME}`);
		return;
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		table.dropColumn(COLUMN_NAME);
		log.info(`Dropped ${TABLE_NAME}.${COLUMN_NAME}`);
	});
};
