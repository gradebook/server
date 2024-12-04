// @ts-check
import initKnex from 'knex';
import objectID from 'bson-objectid';
import {getDatabaseType} from '../database/migration-utils/database-type.js';
import __getKnex from '../database/knex.js';
import config from '../config.js';
import authManager, {globalStoreIsRemote} from './internal-auth.js';
import {mutex} from './mutex.js';

const REMOTE_SERVICE_NAME = 'global_store';

let _knexInstance;
/** @type {string | null} */
let db = null;

function getKnexInstance() {
	if (_knexInstance) {
		return _knexInstance;
	}

	const schoolKnex = __getKnex.instance;
	const schoolDatabaseType = getDatabaseType(schoolKnex);
	const databaseConfiguration = config.get('globalStore:database');

	if (!databaseConfiguration) {
		throw new Error('Global Store is not set up');
	}

	if (typeof databaseConfiguration === 'string') {
		if (schoolDatabaseType !== 'mysql') {
			throw new Error('Global Store database provided as a table, but the school database is sqlite3');
		}

		_knexInstance = schoolKnex;
		db = databaseConfiguration;
		return _knexInstance;
	}

	if (databaseConfiguration.client !== 'mysql') {
		throw new Error('Global Store must use mysql');
	}

	_knexInstance = initKnex(databaseConfiguration);

	return _knexInstance;
}

/**
 * @param {Parameters<typeof __getKnex>[0]} options
 */
function getKnex(options) {
	// NOTE: Needs to run before we assign the db
	const knex = getKnexInstance();
	options.db ??= db;
	return __getKnex(options, knex);
}

const ONE_DAY_MS = 86_400_000;

/** @type {import('./global-store-helper.js').GlobalStoreApi} */
const globalStoreApi = {
	async getUploadMutex(id) {
		if (mutex.acquire(`global_store_${id}`, ONE_DAY_MS)) {
			return getKnex({table: 'uploads'})
				.where('id', id)
				.select(['id', 'hash'])
				.first();
		}

		return null;
	},

	async releaseUploadMutex(id, filePath) {
		try {
			await getKnex({table: 'uploads'})
				.where('id', id)
				.andWhere('path', null)
				.update('path', filePath);
		} finally {
			mutex.release(`global_store_${id}`);
		}
	},

	getUpload(fileHash) {
		return getKnex({table: 'uploads'})
			.where('hash', fileHash)
			.select('id')
			.select('path')
			.first();
	},

	insert(table, data) {
		if (!('id' in data)) {
			data.id = objectID().toHexString();
		}

		return getKnex({table})
			.insert(data);
	},
};

// This should be a named function but JSDoc doesn't support template params
/** @type {import('./global-store-helper.js').GlobalStoreQuery} */
export const executeGlobalStoreMethod = async (methodName, ...methodArguments) => {
	if (globalStoreIsRemote) {
		throw new Error('Running global store queries remotely is not supported');

		/* eslint-disable no-unreachable */
		if (!authManager) {
			throw new Error('Cannot query global store - gateway is not configured');
		}

		const [resolution, rawFetchOptions] = await authManager.getRequestInfo(REMOTE_SERVICE_NAME);
		/** @type {RequestInit} */
		const fetchOptions = rawFetchOptions;
		fetchOptions.headers['content-type'] = 'application/json';
		fetchOptions.method = 'post';
		fetchOptions.body = JSON.stringify([methodName, ...methodArguments]);
		const url = `http://${resolution.ip}:${resolution.port}/api/v0/execute`;
		// eslint-disable-next-line promise/prefer-await-to-then
		return fetch(url, fetchOptions).then(response => response.json());
		/* eslint-enable no-unreachable */
	}

	// @ts-expect-error jsdoc isn't powerful enough :(
	return globalStoreApi[methodName](...methodArguments);
};
