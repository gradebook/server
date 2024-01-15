// @ts-check
import initKnex from 'knex';
import objectID from 'bson-objectid';
import {getDatabaseType} from '../database/migration-utils/database-type.js';
import __getKnex from '../database/knex.js';
import config from '../config.js';
import authManager, {globalStoreIsRemote} from './internal-auth.js';
import {mutex} from './mutex.js';

const REMOTE_SERVICE_NAME = 'global_store';

let knexInstance;
/** @type {string | null} */
let db;

function getKnexInstance() {
	if (knexInstance) {
		return knexInstance;
	}

	const schoolKnex = __getKnex.instance;
	const schoolDatabaseType = getDatabaseType(schoolKnex);
	const databaseConfiguration = config.get('globalStore:database');

	if (!databaseConfiguration) {
		throw new Error('Global Store is not set up');
	}

	if (databaseConfiguration.client !== 'mysql') {
		throw new Error('Global Database must use mysql');
	}

	if (schoolDatabaseType === 'sqlite3') {
		knexInstance = initKnex(databaseConfiguration);
		db = null;
	} else {
		knexInstance = schoolKnex;
		db = databaseConfiguration.connection.database;
	}

	return knexInstance;
}

/**
 * @param {Parameters<typeof __getKnex>[0]} options
 */
function getKnex(options) {
	options.db ??= db;
	return __getKnex(options, getKnexInstance());
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

		const [resolution, fetchOptions] = await authManager.getRequestInfo(REMOTE_SERVICE_NAME);
		const url = `http://${resolution.ip}:${resolution.port}/api/v0/execute`;
		fetchOptions.headers['content-type'] = 'application/json';
		fetchOptions.method = 'post';
		fetchOptions.body = JSON.stringify([methodName, ...methodArguments]);
		// @ts-ignore
		return fetch(url, fetchOptions).then(response => response.json());
		/* eslint-enable no-unreachable */
	}

	// @ts-expect-error jsdoc isn't powerful enough :(
	return globalStoreApi[methodName](...methodArguments);
};
