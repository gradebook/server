// @ts-check
import {spawn} from 'child_process';
import {homedir} from 'os';
import {env as pEnv} from 'process';
import {importJson} from '../utils/import-json.js';

import {frontend} from '../api/index.js';

const pkg = await importJson('../../package.json', import.meta.url);

let version = null;

// Ensure the home directory is always set in the environment so git can load the user `.gitconfig`
// if needed. Example use case: safe.directory
const env = {HOME: homedir(), ...pEnv};
const cmd = spawn('git', ['rev-parse', 'HEAD'], {env});

cmd.stdout.on('data', data => {
	data = String(data).trim().slice(0, 7);
	version = {server: `${pkg.version}@${data}`};
});

// If we were unable to get the git hash for some reason, default to just the version since that's
// better than nothing
cmd.on('exit', () => {
	if (!version) {
		version = {server: pkg.version};
	}
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
