// @ts-check
const Redis = require('ioredis');
const config = require('../config');

if (String(config.get('redis')) !== 'true') {
	const logging = require('../logging');
	logging.error({level: 'critical', message: '⚠ Redis was called when not enabled ⚠'});
	process.exit(101); // eslint-disable-line unicorn/no-process-exit
}

module.exports = new Redis(config.get('redisOptions'));
