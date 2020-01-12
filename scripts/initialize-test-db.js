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
			return txn(table)
				.insert(values)
				.then(() => log(`Added fixture ${id}`))
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
