// @ts-check
import {createTable} from '../commands.js';
import schema from '../schema.js';
import logging from '../../logging.js';

const schemaTables = Object.keys(schema);

async function createTables(knex) {
	for (const table of schemaTables) {
		logging.info(`Creating table: ${table}`);
		await createTable(table, knex); // eslint-disable-line no-await-in-loop
	}
}

export {createTables as up};

export const down = () => true;
