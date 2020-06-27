const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_NAME = 'cutoffs';

exports.up = async ({connection}) => {
	log.info(`Adding ${TABLE_NAME}.${COLUMN_NAME}`);
	const shouldMigrate = !(await connection.schema.hasColumn(TABLE_NAME, COLUMN_NAME));

	if (!shouldMigrate) {
		log.warn(`Added ${TABLE_NAME}.${COLUMN_NAME}`);
		return;
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		table.json(COLUMN_NAME).defaultTo('{}');
		log.info(`Added ${TABLE_NAME}.${COLUMN_NAME}`);
	});
};

exports.down = async ({connection}) => {
	log.info(`Dropping ${TABLE_NAME}.${COLUMN_NAME}`);
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
