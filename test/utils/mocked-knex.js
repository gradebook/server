// @ts-check
import Sqlite3Client from 'knex/lib/dialects/sqlite3/index.js';
import MysqlClient from 'knex/lib/dialects/mysql/index.js';

/** @typedef {(state: {sql: string, bindings: any[]}) => any} Interceptor */

/** @type {(MockableMysqlClient | MockableMysqlClient) & {_mocking: boolean}} */
let client;

/** @type {{sql: string; bindings: string[]}[]} */
const trackedQueries = [];

/** @type {null | Interceptor} */
let activeInterceptor = null;

function setClient(instance) {
	if (client) {
		throw new Error('Mocked Knex client has already been created');
	}

	client = instance;
}

/**
 * @param {unknown} connection
 * @param {object} state
 */
function tryMocking(connection, state) {
	if (client._mocking) {
		if (activeInterceptor) {
			client.gbStoreMockedResponse(state, activeInterceptor(state));
		} else {
			state.context = {};
		}

		trackedQueries.push({sql: state.sql, bindings: state.bindings});
		return Promise.resolve(state);
	}

	return null;
}

class MockableMysqlClient extends MysqlClient {
	constructor(...args) {
		super(...args);
		// @ts-expect-error not worth properly typing for now
		this.config.client = 'mysql';
		this._mocking = false;
		setClient(this);
	}

	_query(connection, state) {
		return tryMocking(connection, state) || super._query(connection, state);
	}

	gbStoreMockedResponse(state, response) {
		switch (state.method) {
			case 'first': {
				state.response = [[response]];
				break;
			}

			case 'pluck': {
				throw new Error('Mocking pluck is not supported');
			}

			case 'insert': {
				state.response = [{insertId: response}];
				break;
			}

			case 'del':
			case 'update':
			case 'counter': {
				state.response = [{affectedRows: response}];
				break;
			}

			// Includes 'select'
			default: {
				state.response = [response];
			}
		}
	}
}

class MockableSqlite3Client extends Sqlite3Client {
	constructor(...args) {
		super(...args);
		// @ts-expect-error not worth properly typing for now
		this.config.client = 'sqlite3';
		this._mocking = false;
		setClient(this);
	}

	_query(connection, state) {
		return tryMocking(connection, state) || super._query(connection, state);
	}

	gbStoreMockedResponse(state, response) {
		// Based on Sqlite3_Client#processResponse
		switch (state.method) {
			case 'first': {
				state.response = [response];
				break;
			}

			case 'pluck': {
				throw new Error('Mocking pluck is not supported');
			}

			case 'insert': {
				state.context = {lastId: response};
				break;
			}

			case 'del':
			case 'update':
			case 'counter': {
				state.context = {changes: response};
				break;
			}

			// Includes 'select'
			default: {
				state.response = response;
			}
		}
	}
}

/** @param {string} clientName */
export function getClient(clientName) {
	if (clientName === 'sqlite3') {
		return MockableSqlite3Client;
	}

	if (clientName === 'mysql') {
		return MockableMysqlClient;
	}

	throw new Error(`Unknown client: ${clientName}`);
}

export const enableQueryTracking = () => {
	if (client._mocking) {
		throw new Error('Query tracking is already enabled. Did you forget to disable query tracking?');
	}

	client._mocking = true;
};

export const removeQueryTracking = () => {
	client._mocking = false;
	trackedQueries.length = 0;
};

/** @returns {Readonly<typeof trackedQueries>} */
export function recallQueries() {
	return trackedQueries;
}

/** @param {Interceptor} interceptor */
export function interceptQuery(interceptor) {
	if (activeInterceptor) {
		throw new Error('Attempted to add query interceptor when one already exists');
	}

	activeInterceptor = (...args) => {
		activeInterceptor = null;
		return interceptor(...args);
	};
}
