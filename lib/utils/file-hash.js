// @ts-check
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

/**
* @param {string | Buffer} fileOrData
*/
export async function sha1(fileOrData) {
	if (typeof fileOrData === 'string') {
		fileOrData = await readFile(fileOrData);
	}

	const hasher = createHash('sha1');
	hasher.update(fileOrData);
	return hasher.digest('hex');
}
