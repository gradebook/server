// @ts-check
import createDebugger from 'ghost-ignition/lib/debug.js';
import config from '../config.js';
import {validHost, validTable} from '../utils/host-matching.js';
import log from '../logging.js';
import {InternalServerError} from '../errors/index.js';

const debug = createDebugger('host-matching');

let toBeExported = null;

if (String(config.get('hostMatching:enabled')) === 'true') {
	if (config.get('database:client') === 'sqlite3') {
		const error = new InternalServerError({message: 'Host matching is not compatible with SQLite'});
		log.error(error);
		throw error;
	}

	const hosts = config.get('hostMatching:hosts');

	/** @type {Map<string, string>} */
	const hostMap = new Map();

	for (const host in hosts) {
		if (!Object.prototype.hasOwnProperty.call(hosts, host)) {
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

	debug('Host matching has been enabled. Hosts: %O', hostMap.keys());

	toBeExported = hostMap;
} else {
	debug('Host Matching is disabled');
}

export const hostMap = toBeExported;
