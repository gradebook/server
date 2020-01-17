const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_NAME = 'credit_hours';

exports.up = ({connection}) => {
	const shouldMigrate = !(await connection.schema.hasColumn(TABLE_NAME, COLUMN_NAME));

	if (!shouldMigrate) {
		log.warn(`Removed ${TABLE_NAME}.${COLUMN_NAME}`);
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
		log.warn(`Removed ${TABLE_NAME}.${COLUMN_NAME}`);
		return;
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		table.dropColumn(COLUMN_NAME);
		log.info(`Removed ${TABLE_NAME}.${COLUMN_NAME}`);
	});
};
