// @ts-check
import {spawn} from 'child_process';
import {importJson} from '../utils/import-json.js';

import {frontend} from '../api/index.js';

const pkg = await importJson('../../package.json', import.meta.url);

let version = null;

const cmd = spawn('git', ['rev-parse', 'HEAD']);

cmd.stdout.on('data', data => {
	data = String(data).trim().slice(0, 7);
	version = {server: `${pkg.version}@${data}`};
});

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.ResponseWithContext} response
 */
export const getVersion = (request, response) => {
	if (!version) {
		return response.status(503).end('Version has not been determined, please try again later');
	}

	version.client = frontend.version();
	response.set('Content-Type', 'application/json');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(JSON.stringify(version));
};
