// @ts-check
/** @type {import('node-fetch')['default']} */
// @ts-expect-error
const fetch = require('node-fetch');
const authManager = require('./internal-auth');

const SERVICE_NAME = 'shrink';

if (authManager) {
	module.exports = {
		/**
		 * @param {string} slug
		 */
		async read(slug) {
			const [resolution, fetchOptions] = await authManager.getRequestInfo(SERVICE_NAME);
			const url = `http://${resolution.ip}:${resolution.port}/api/v0/slug/${slug}`;
			return fetch(url, fetchOptions).then(response => response.json());
		},

		/**
		 * @param {string} slug
		 */
		async markAsUsed(slug) {
			const [resolution, fetchOptions] = await authManager.getRequestInfo(SERVICE_NAME);
			fetchOptions.headers['content-type'] = 'application/json';
			fetchOptions.method = 'post';
			fetchOptions.body = JSON.stringify({slug});

			const url = `http://${resolution.ip}:${resolution.port}/api/v0/slug/increase-popularity`;
			return fetch(url, fetchOptions).then(response => response.json());
		},
	};
} else {
	module.exports = {
		/**
		 * @param {string} slug
		 */
		async read(slug) {
			throw new Error(`Cannot read slug ${slug} because gateway is not enabled`);
		},

		/**
		 * @param {string} _
		 */
		async markAsUsed(_) {},
	};
}
