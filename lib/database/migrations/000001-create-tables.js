// @ts-check
import Promise from 'bluebird';
import {createTable} from '../commands.js';
import schema from '../schema.js';
import logging from '../../logging.js';

const schemaTables = Object.keys(schema);

function createTables(knex) {
	return Promise.mapSeries(schemaTables, function createSingleTable(table) {
		logging.info(`Creating table: ${table}`);
		return createTable(table, knex);
	});
}

export {createTables as up};

export const down = () => true;
