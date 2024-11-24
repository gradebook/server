// @ts-check

/**
 * @typedef {typeof fetch} Fetch
 *
 * @typedef {{
 *   retry?: number | false;
 *   json?: boolean;
 *   jsonOk?: boolean;
 * }} EnhancedFetchOptions
 */

export class FetchError extends Error {
	/**
	 * @param {string} message
	 * @param {unknown} [body]
	 */
	constructor(message, body = null) {
		super(message);
		this.body = body;
	}
}

/**
 * @param {Parameters<Fetch>[0]} url
 * @param {Parameters<Fetch>[1]} options
 * @param {number} remaining
 * @param {unknown} originalError
 * @returns {ReturnType<Fetch>}
 */
async function fetchRetry(url, options, remaining, originalError = null) {
	try {
		return await fetch(url, options);
	} catch (error) {
		if (remaining === 0) {
			throw originalError ?? error;
		}

		return fetchRetry(url, options, remaining - 1);
	}
}

/**
 * @param {Awaited<ReturnType<Fetch>>} response
 * @returns {Promise<unknown>}
 */
async function getFailedBody(response) {
	let body = await response.text().catch(() => '');
	try {
		body = JSON.parse(body);
	} catch {}

	return body;
}

/**
 * @param {Parameters<Fetch>[0]} url
 * @param {Parameters<Fetch>[1]} fetchOptions
 * @param {EnhancedFetchOptions} extensionOptions
 */
export async function fetchEnhanced(url, fetchOptions, {retry = 3, json, jsonOk = true} = {}) {
	const responsePromise = typeof retry === 'number'
		? fetchRetry(url, fetchOptions, retry)
		: fetch(url, fetchOptions);

	const response = await responsePromise;

	if (json) {
		if (jsonOk && !response.ok) {
			throw new FetchError('Response was not ok', await getFailedBody(response));
		}

		const contentType = response.headers.get('content-type');
		if (!contentType || contentType.startsWith('application/json')) {
			return response.json();
		}

		throw new FetchError(`Unknown response content type: ${contentType ?? '(none)'}`, getFailedBody(response));
	}

	return response;
}
