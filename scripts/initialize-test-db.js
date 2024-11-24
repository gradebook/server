// @ts-check
import process from 'process';
import path from 'path';
import {fileURLToPath} from 'url';
/* eslint-disable-next-line import/no-unassigned-import */
import '../test/global.js'; // Update env
import * as config from '../test/utils/test-config.js';
import {fixtures} from '../test/fixtures/example-data.js';
import {migrator, knex} from '../lib/database/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../');
process.chdir(root);

let log = (...args) => console.log(...args);

if (config.isCI) {
	log = () => false; // Noop fixture creation logs for CI
}

try {
	await migrator.init();

	const txn = await knex.instance.transaction();
	try {
		const promises = fixtures.map(([table, values], idx) => {
			const id = idx + 1;
			log(`Adding fixture ${id} to ${table}`);
			let query;

			if (txn.client.config.client === 'sqlite3') {
				query = txn(table).insert(values).toString().replace(/^insert/i, 'insert or replace');
			} else {
				const insert = txn(table).insert(values).toString();
				const update = txn(table).update(values).toString().replaceAll(/^update(.*?)set\s/gi, '');

				query = `${insert} ON DUPLICATE KEY UPDATE ${update}`;
			}

			// eslint-disable-next-line promise/prefer-await-to-then
			return txn.raw(query).then(() => log(`Added fixture ${id}`))
				// eslint-disable-next-line promise/prefer-await-to-then
				.catch(error => console.error(`Failed adding fixture ${id}`, error));
		});

		await Promise.all(promises);
		await txn.commit();
	} catch (error) {
		console.error(error);
		await txn.rollback();
	}
} finally {
	knex.instance.destroy();
}
