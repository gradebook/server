const {resolve} = require('path');
/* eslint-disable-next-line import/no-unassigned-import */
require('../test/global.js'); // Update env
const {fixtures} = require('../test/fixtures/example-data');

const root = resolve(__dirname, '../');
process.chdir(root);

const {migrator, knex} = require('../lib/database');

let log = (...args) => console.log(...args);

if (process.env.CI === 'true') {
	log = () => false; // Noop fixture creation logs for CI
}

migrator.startup().then(async () => {
	knex.init();

	const txn = await knex.instance.transaction();
	try {
		const promises = fixtures.map(([table, values], idx) => {
			const id = idx + 1;
			log(`Adding fixture ${id} to ${table}`);
			let query;

			if (txn.client.config.client === 'sqlite3') {
				query = txn(table).insert(values).toString().replace(/^INSERT/i, 'insert or replace');
			} else {
				const insert = trx(tableName).insert(tuple).toString()
				const update = trx(tableName).update(tuple).toString().replace(/^update(.*?)set\s/gi, '')

				query = `${insert} ON DUPLICATE KEY UPDATE ${update}`
			}

			return txn.raw(query).then(() => log(`Added fixture ${id}`))
				.catch(error => console.error(`Failed adding fixture ${id}`, error));
		});

		await Promise.all(promises);
		await txn.commit();
	} catch (error) {
		console.error(error);
		await txn.rollback();
	}

	knex.instance.destroy();
});
