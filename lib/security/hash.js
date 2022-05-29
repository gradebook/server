// @ts-check
import {Buffer} from 'buffer';
import {createHash, webcrypto} from 'crypto';
import {TextEncoder} from 'util';

const textEncoder = new TextEncoder();

// @ts-expect-error WebCrypto support in Node.js isn't properly documented at this time
/** @type {Record<string, CryptoKey>} */
const keyCache = {};

export const getHash = data => createHash('sha512').update(data).digest('base64');
export default getHash;

/**
 * @param {string} key
 * @param {string} data
 */
export async function createWebHmac(key, data) {
	const dataAsBytes = textEncoder.encode(data);
	const cryptoKey = keyCache[key] ?? await webcrypto
		// @ts-expect-error Webcrypto types are part of lib.dom which we don't want to include since this codebase does not
		// run in the browser
		.subtle.importKey('raw', textEncoder.encode(key), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);

	keyCache[key] = cryptoKey;

	/** @type {ArrayBuffer} */
	const uint8Response = await webcrypto
		// @ts-expect-error no webcrypto types
		.subtle.sign('HMAC', cryptoKey, dataAsBytes);

	return Buffer.from(uint8Response).toString('hex');
}
