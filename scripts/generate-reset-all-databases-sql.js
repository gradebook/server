// @ts-check
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
import {knex} from '../lib/database/index.js';

async function run() {
	const databases = await knex.instance.raw('SHOW DATABASES;');
	for (const database of databases[0]) {
		if (['information_schema', 'performance_schema', 'mysql'].includes(database.Database)) {
			continue;
		}

		const r = await knex.instance.raw(`SHOW TABLES IN ${database.Database};`);
		const retry = [];
		for (const t of r[0]) {
			const q = `drop table ${database.Database}.${t[`Tables_in_${database.Database}`]}`;
			console.log(q);
			try {
				await knex.instance.raw(q);
			} catch (error) {
				retry.push(q);
			}
		}

		while(retry.length) {
			const q= retry.shift();
			try {
				await knex.instance.raw(q);
			} catch (error) {
				retry.push(q);
			}
		}
	}
}

run().finally(_ => knex.instance.client.destroy());
/* eslint-enable */
