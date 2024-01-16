// @ts-check
import session from 'express-session';
import config from '../config.js';

/** @typedef {import('connect-session-knex').StoreFactory} StoreFactory */
/** @typedef {ConstructorParameters<StoreFactory>[0]} ConfigType */

export async function _getStore() {
	if (String(config.get('redis')) === 'true') {
		const Store = await import('connect-redis').then(mod => mod.default);

		const storeOptions = {
			prefix: 'sessionAGB',
			client: await import('../database/redis.js').then(mod => mod.redis),
		};

		return new Store(storeOptions);
	// @TODO: revert to previous implementation when connect-redis's exports the proper types
	// eslint-disable-next-line no-else-return
	} else {
		const Store = await import('connect-session-knex').then(mod => mod.default(session));
		const knex = await import('../database/index.js').then(mod => mod.knex.instance);

		/** @type {ConfigType} */
		const storeOptions = {
			knex,
			createtable: false,
			sidfieldname: 'sessionAGB',
			// Clear expired sessions every week
			clearInterval: 1000 * 60 * 60 * 24 * 7,
		};
		return new Store(storeOptions);
	}
}

export default await _getStore();
