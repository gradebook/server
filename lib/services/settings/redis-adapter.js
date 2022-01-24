// @ts-check
import {redis} from '../../database/redis.js';
import {AbstractSettingsStore} from './base-adapter.js';

export class RedisStore extends AbstractSettingsStore {
	/**
	 * @override
	 */
	async setMultiple(kvPairs) {
		await redis.hmset('settings', kvPairs.flat());
	}

	/**
	 * @override
	 */
	async fetch() {
		return redis.hgetall('settings');
	}
}

export const Adapter = RedisStore;
