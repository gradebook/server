// @ts-check
import config from '../config.js';
import log from '../logging.js';
import {hostMap as defaultHostMap} from '../services/host.js';
import {FetchError, fetchEnhanced} from './enhanced-fetch.js';

let _fetch = fetchEnhanced;

/**
 * @param {string} zone
 * @param {string} token
 * @param {string[]} files
 * @returns {Promise<any>}
 */
export async function clearCache(zone, token, files) {
	const endpoint = `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`;
	const body = JSON.stringify({files});
	const headers = {
		'content-type': 'application/json',
		authorization: `Bearer ${token}`,
	};

	try {
		return await _fetch(endpoint, {method: 'POST', headers, body}, {retry: false, json: true});
	} catch (error) {
		if (error instanceof FetchError) {
			log.error(error);
			return error.body;
		}

		throw error;
	}
}

/**
 * @param {typeof defaultHostMap | void} [hostMap]
 */
export async function clearCacheIfNeeded(hostMap = defaultHostMap) {
	if (String(config.get('cloudflare:enabled')) !== 'true') {
		return;
	}

	const zone = config.get('cloudflare:zone');
	const token = config.get('cloudflare:token');
	const urls = [];

	if (hostMap) {
		for (const [domain] of hostMap.entries()) {
			urls.push(`https://${domain}/api/v0/version`);
		}
	} else {
		urls.push(
			config.get('cloudflare:urlRoot') + '/api/v0/version',
		);
	}

	try {
		const response = await clearCache(zone, token, urls);
		if (response.success.toString() !== 'true') {
			log.error(`Failed clearing cloudflare cache: ${JSON.stringify(response)}`);
			return;
		}

		log.info('Successfully cleared cloudflare cache');
	} catch (error) {
		log.error('Failed clearing cloudflare cache:');
		log.error(error);
	}
}

export const __test = {
	setFetch(newFetch) {
		const oldFetch = _fetch;
		_fetch = newFetch;
		return () => __test.setFetch(oldFetch);
	},
};
