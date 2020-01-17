const log = require('../../../../logging');

const TABLE_NAME = 'courses';
const COLUMN_SCHEMAS = [{
	name: 'cut1Name',
	default: 'A',
	maxLength: 5
}, {
	name: 'cut2Name',
	default: 'B',
	maxLength: 5
}, {
	name: 'cut3Name',
	default: 'C',
	maxLength: 5
}, {
	name: 'cut4Name',
	default: 'D',
	maxLength: 5
}];

exports.up = async ({transacting: connection}) => {
	const changes = [];

	for (const migration of COLUMN_SCHEMAS) {
		const shouldMigrate = !(await connection.schema.hasColumn(TABLE_NAME, migration.name));

		if (shouldMigrate) {
			changes.push(migration);
		} else {
			log.warn(`Added ${TABLE_NAME}.${migration.name}`)
		}
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		for (const {name, maxLength, default: fallback} of changes) {
			table.string(name, maxLength).notNull().defaultTo(fallback);
			log.info(`Added ${TABLE_NAME}.${name}`);
		}
	});
};

exports.down = async ({transacting: connection}) => {
	const changes = [];

	for (const migration of COLUMN_SCHEMAS) {
		const shouldMigrate = await connection.schema.hasColumn(TABLE_NAME, migration.name);

		if (shouldMigrate) {
			changes.push(migration);
		} else {
			log.warn(`Dropped ${TABLE_NAME}.${migration.name}`)
		}
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		for (const {name} of changes) {
			table.dropColumn(name);
			log.info(`Dropped ${TABLE_NAME}.${name}`);
		}
	});
};

exports.config = {
	transaction: true
};
