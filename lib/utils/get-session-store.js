// @ts-check
import session from 'express-session';
import config from '../config.js';

export async function _getStore() {
	// CASE: Redis is enabled so we use a Redis-backed session store
	if (String(config.get('redis')) === 'true') {
		const Store = await import('connect-redis').then(mod => mod.default);

		return new Store({
			prefix: 'sessionAGB',
			client: await import('../database/redis.js').then(mod => mod.redis),
		});
	}

	// CASE: Redis is not enabled so we default to using a database-backed session store
	const [Store, knex] = await Promise.all([
		import('connect-session-knex').then(mod => mod.default(session)),
		import('../database/index.js').then(mod => mod.knex.instance),
	]);

	return new Store({
		knex,
		createtable: false,
		sidfieldname: 'sessionAGB',
		// Clear expired sessions every week
		clearInterval: 1000 * 60 * 60 * 24 * 7,
	});
}

export default await _getStore();
