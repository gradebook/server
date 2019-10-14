const got = require('got');
const config = require('../config');
const log = require('../logging');

async function clearCache(zone, token, url) {
	const endpoint = `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`;
	const body = JSON.stringify({files: [url]});
	const headers = {
		'content-type': 'application/json',
		'authorization': `Bearer ${token}`
	};

	return got.post(endpoint, {headers, body}).then(r => JSON.parse(r.body)).catch(error => {
		if (error.name !== 'HTTPError') {
			throw error;
		}

		return JSON.parse(error.body);
	});
}

module.exports = async function clearCacheIfNeeded() {
	if (config.get('cloudflare:enabled').toString() !== 'true') {
		return;
	}

	const zone = config.get('cloudflare:zone');
	const token = config.get('cloudflare:token');
	const url = config.get('cloudflare:urlRoot') + '/api/v0/version';

	try {
		const response = await clearCache(zone, token, url);
		if (response.success !== true) {
			log.error(`Failed clearing cloudflare cache: ${JSON.stringify(response)}`);
			return;
		}

		log.info('Successfully cleared cloudflare cache');
	} catch (error) {
		log.error(`Failed clearing cloudflare cache:`);
		log.error(error);
	}
};
