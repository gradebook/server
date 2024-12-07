// @ts-check
import path from 'path';
import {readFile} from 'fs/promises';
import {fileURLToPath} from 'url';
import {ConsistencyError} from '../errors/index.js';
import logging from '../logging.js';
import config from '../config.js';

const enableCaching = config.get('cache frontend');

const LOCATION = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/client/release/browser/index.html');
const FRONTEND_VERSION_REGEX = /<meta name="x-client-version" value="(.*)"[\s+/]>/;

let template = null;
let frontendVersion = 'unknown';

export async function refresh() {
	try {
		const file = await readFile(LOCATION, 'utf8');
		template = file.replace(FRONTEND_VERSION_REGEX, (_, match) => {
			if (match !== '__VERSION_STRING__') {
				frontendVersion = match;
			}

			return '';
		});

		if (enableCaching && frontendVersion === 'unknown') {
			logging.error(new ConsistencyError({
				message: 'Client Version is "unknown"',
				help: 'Check the regex since the template markup could have changed',
			}));
		}
	} catch (error) {
		if (error.code !== 'ENOENT') {
			logging.error(error);
		}
	}
}

export const version = () => frontendVersion;

export const get = async function getTemplate() {
	if (template && enableCaching) {
		return template;
	}

	await refresh();

	return template || '</head>ENOTEMPLATE';
};

// eslint-disable-next-line unicorn/prefer-top-level-await
refresh();
