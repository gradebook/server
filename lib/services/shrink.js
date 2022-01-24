// @ts-check
import fetch from 'node-fetch';
import authManager from './internal-auth.js';

const SERVICE_NAME = 'shrink';

let readImpl;
let markAsUsedImpl;

if (authManager) {
	/**
		 * @param {string} slug
		 */
	readImpl = async function read(slug) {
		const [resolution, fetchOptions] = await authManager.getRequestInfo(SERVICE_NAME);
		const url = `http://${resolution.ip}:${resolution.port}/api/v0/slug/${slug}`;
		return fetch(url, fetchOptions).then(response => response.json());
	};

	/**
		 * @param {string} slug
		 */
	markAsUsedImpl = async function markAsUsed(slug) {
		const [resolution, fetchOptions] = await authManager.getRequestInfo(SERVICE_NAME);
		fetchOptions.headers['content-type'] = 'application/json';
		fetchOptions.method = 'post';
		fetchOptions.body = JSON.stringify({slug});

		const url = `http://${resolution.ip}:${resolution.port}/api/v0/slug/increase-popularity`;
		return fetch(url, fetchOptions).then(response => response.json());
	};
} else {
	/**
		 * @param {string} slug
		 */
	readImpl = async function read(slug) {
		throw new Error(`Cannot read slug ${slug} because gateway is not enabled`);
	};

	/**
		 * @param {string} _
		 */
	markAsUsedImpl = async function markAsUsed(_) {};
}

export const read = readImpl;
export const markAsUsed = markAsUsedImpl;
