// @ts-check
import Redis from 'ioredis';
import logging from '../logging.js';
import config from '../config.js';

let instance = {};

if (process.env.NODE_ENV === 'testing' && process.env.TEST_ENV !== 'redis') {
} else {
	if (String(config.get('redis')) !== 'true') {
		logging.error({level: 'critical', message: '⚠ Redis was called when not enabled ⚠'});
		process.exit(101); // eslint-disable-line unicorn/no-process-exit
	}

	instance = new Redis(config.get('redisOptions'));
}

export const redis = instance;
