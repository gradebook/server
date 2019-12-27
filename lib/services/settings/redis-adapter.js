// @ts-check
const redis = require('../../database/redis');
const AbstractSettingsStore = require('./base-adapter');

module.exports = class RedisStore extends AbstractSettingsStore {
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
};
