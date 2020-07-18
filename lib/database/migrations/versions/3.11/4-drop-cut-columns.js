const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_SCHEMAS = [{
	name: 'cut1',
	fallback: 90
}, {
	name: 'cut2',
	fallback: 80
}, {
	name: 'cut3',
	fallback: 70
}, {
	name: 'cut4',
	fallback: 60
}];

exports.up = async ({transacting: connection}) => {
	const changes = [];

	for (const migration of COLUMN_SCHEMAS) {
		// eslint-disable-next-line no-await-in-loop
		const shouldMigrate = await connection.schema.hasColumn(TABLE_NAME, migration.name);

		if (shouldMigrate) {
			changes.push(migration);
		} else {
			log.warn(`Failed to drop ${TABLE_NAME}.${migration.name}`);
		}
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		for (const {name} of changes) {
			table.dropColumn(name);
			log.info(`Dropped ${TABLE_NAME}.${name}`);
		}
	});
};

exports.down = async ({transacting: connection}) => {
	const changes = [];

	for (const migration of COLUMN_SCHEMAS) {
		// eslint-disable-next-line no-await-in-loop
		const shouldMigrate = !(await connection.schema.hasColumn(TABLE_NAME, migration.name));

		if (shouldMigrate) {
			changes.push(migration);
		} else {
			log.warn(`Failed to add ${TABLE_NAME}.${migration.name}`);
		}
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		for (const {name, fallback} of changes) {
			table.float(name).notNull().defaultTo(fallback);
			log.info(`Added ${TABLE_NAME}.${name}`);
		}
	});
};

exports.config = {
	transaction: true
};
