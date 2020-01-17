const log = require('../../../../logging');

const TABLE_NAME = 'users';
const COLUMN_NAME = 'isNew';

exports.up = async ({connection}) => {
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

exports.down = async ({connection}) => {
	const shouldMigrate = !(await connection.schema.hasColumn(TABLE_NAME, COLUMN_NAME));

	if (!shouldMigrate) {
		log.warn(`Added ${TABLE_NAME}.${COLUMN_NAME}`);
		return;
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		table.integer(COLUMN_NAME).notNull().defaultTo(1);
		log.info(`Added ${TABLE_NAME}.${COLUMN_NAME}`);
	});
};
