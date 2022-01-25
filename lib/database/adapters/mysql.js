// @ts-check
import knex from '../knex.js';

const doRawAndFlatten = function doRawAndFlatten(query, txn, flattenFn) {
	return knex({txn}).raw(query).then(response =>
		flattenFn(response).flat(),
	);
};

export const getTables = async function getTables(txn) {
	/*
	* Executing `SHOW TABLES` via knex returns something like
	* [[
		RowDataPacket {Tables_in_information_schema: 'TABLE_NAME'},
		RowDataPacket {Tables_in_information_schema: 'TABLE_NAME'},
		RowDataPacket {Tables_in_information_schema: 'TABLE_NAME'}
	], ...]
	* We only want the RowDataPacketResponses which is what this does
	*/
	return doRawAndFlatten('SHOW TABLES', txn, ([response]) =>
		response.map(table => Object.values(table)),
	);
};

export const getColumns = function getColumns(table, txn) {
	return doRawAndFlatten(`SHOW COLUMNS FROM ${table}`, txn, ([response]) =>
		response.map(({Field}) => Field),
	);
};
