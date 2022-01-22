// @ts-check
import session from 'express-session';
import config from '../config.js';

export async function _getStore() {
	/** @type {import('connect-redis').RedisStore | import('connect-session-knex').StoreFactory} */
	let Store;
	/** @type {import('connect-redis').RedisStoreOptions | import('connect-session-knex').ConfigType} */
	let storeOptions;

	if (String(config.get('redis')) === 'true') {
		Store = await import('connect-redis').then(mod => mod.default(session));

		storeOptions = {
			prefix: 'sessionAGB',
			client: await import('../database/redis.js').then(mod => mod.redis),
		};
	} else {
		Store = await import('connect-session-knex').then(mod => mod.default(session));
		const knex = await import('../database/index.js').then(mod => mod.knex.instance);

		storeOptions = {
			knex,
			createTable: false,
			sidfieldname: 'sessionAGB',
			// Clear expired sessions every week
			clearInterval: 1000 * 60 * 60 * 24 * 7,
		};
	}

	return new Store(storeOptions);
}

export default await _getStore();
