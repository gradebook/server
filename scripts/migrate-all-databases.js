// @ts-check
if (process.env.NODE_ENV !== 'production') {
	let altText = ' is not set';
	if (process.env.NODE_ENV) {
		altText = `("${process.env.NODE_ENV}") is not production`;
	}

	console.log(
		`Warning: NODE_ENV${altText}, updating to production.`,
	);

	process.env.NODE_ENV = 'production';
}

const path = require('path');
const KnexMigrator = require('knex-migrator');
/** @type Map<string, string> */
const hosts = require('../lib/services/host');

const migrator = new KnexMigrator({
	migratorFilePath: path.resolve(__dirname, '../'),
});

async function migrate() {
	for (const [, database] of hosts) {
		migrator.dbConfig.connection.database = database;
		console.log('Migrating', database);
		try {
			// eslint-disable-next-line no-await-in-loop
			await migrator.migrate();
		} catch (error) {
			console.log(`Failed migrating ${database}, aborting.`);
			console.error(error);
			process.exit(2); // eslint-disable-line unicorn/no-process-exit
		}

		console.log('Migrated', database);
	}
}

migrate();
