// @ts-check
const got = require('got').default;
const config = require('../config');
const log = require('../logging');
const hostService = require('../services/host');

/**
 * @param {string} zone
 * @param {string} token
 * @param {string[]} files
 */
async function clearCache(zone, token, files) {
	const endpoint = `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`;
	const body = JSON.stringify({files});
	const headers = {
		'content-type': 'application/json',
		authorization: `Bearer ${token}`,
	};

	return got.post(endpoint, {headers, body}).then(r => JSON.parse(r.body)).catch(error => {
		if (error.name !== 'HTTPError') {
			throw error;
		}

		return JSON.parse(error.body);
	});
}

module.exports = async function clearCacheIfNeeded() {
	if (String(config.get('cloudflare:enabled')) !== 'true') {
		return;
	}

	const zone = config.get('cloudflare:zone');
	const token = config.get('cloudflare:token');
	const urls = [];

	if (hostService) {
		for (const [domain] of hostService.entries()) {
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
};
