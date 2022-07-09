// @ts-check
import {fileURLToPath} from 'url';
import path from 'path';
import {readFile} from 'fs/promises';

/**
 * @param {string} relativePath
 * @param {string} root
 */
export async function importJson(relativePath, root) {
	const absolutePath = path.resolve(
		path.dirname(fileURLToPath(root)),
		relativePath,
	);

	const contents = await readFile(absolutePath, 'utf8');

	return JSON.parse(contents);
}
