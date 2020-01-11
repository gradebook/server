// @ts-check

const config = require('../config');
const {validHost, validTable} = require('../utils/host-matching');
const log = require('../logging');
const {InternalServerError} = require('../errors');

function init() {
	if (String(config.get('hostMatching:enabled')) !== 'true') {
		module.exports = null;
		return;
	}

	if (config.get('database:client') === 'sqlite3') {
		const error = new InternalServerError({message: 'Host matching is not compatible with SQLite'});
		log.error(error);
		throw error;
	}

	const hosts = config.get('hostMatching:hosts');

	/** @type {Map<string, string>} */
	const hostMap = new Map();

	for (const host in hosts) {
		if (!(host in hosts)) {
			continue;
		}

		const table = hosts[host];

		if (!validHost(host)) {
			throw new Error(`Invalid Host: ${host}`);
		}

		if (!validTable(table)) {
			throw new Error(`Invalid Table: ${table}`);
		}

		if (hostMap.has(host)) {
			throw new Error(`Duplicate Host: ${host}`);
		}

		hostMap.set(host, table);
	}

	module.exports = hostMap;
}

init();
