const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_SCHEMAS = [{
	name: 'cut1',
	default: 90
}, {
	name: 'cut2',
	default: 80
}, {
	name: 'cut3',
	default: 70
}, {
	name: 'cut4',
	default: 60
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
		for (const {name, default: fallback} of changes) {
			table.float(name).notNull().defaultTo(fallback);
			log.info(`Added ${TABLE_NAME}.${name}`);
		}
	});
};

exports.config = {
	transaction: true
};
