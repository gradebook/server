// @ts-check
import path from 'path';
import _fs from 'fs';
import {fileURLToPath} from 'url';

const fs = _fs.promises;

const CONFIG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.gradebook-cli');
const properDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../');

const MAJOR_MINOR_MATCH = 'v16.13.';

/** @type {import('execa')} */
let execa;
try {
	({default: execa} = await import('execa'));
} catch {
	console.error('Please run `yarn install` in the root');
	process.exit(1);
}

export async function precheck(isSetup = false) {
	process.chdir(properDir);

	// First, check the node version
	if (!process.version.startsWith(MAJOR_MINOR_MATCH)) {
		console.error(`Node version must be ${MAJOR_MINOR_MATCH}x`);
		process.exit(1);
	}

	// Next, check the git version
	const {stdout: gitVersion} = await execa('git', ['--version']);

	if (!gitVersion.startsWith('git version 2.')) {
		console.error('Git version 2.x must be installed');
		process.exit(1);
	}

	// Next, check that the client submodule was initialized by checking if a known file exists
	const clientLockFileExists = _fs.existsSync('./lib/frontend/client/yarn.lock');

	if (!clientLockFileExists && !isSetup) {
		console.error('Submodule `client` not cloned! Run `git submodule init` and try again.');
		process.exit(1);
	}

	// Finally, re-install dependencies if needed
	let latestVersions = {};
	let hashesChanged = false;

	try {
		latestVersions = JSON.parse(await fs.readFile(CONFIG, 'utf-8'));
	} catch {}

	// Lazy-import since it depends on execa
	const {getGitHash: getHash} = await import('./utils/get-git-hash.js');
	const {runInstall} = await import('./utils/run-yarn-install.js');
	const {stdout: lastBackendVersion} = await getHash('./yarn.lock');
	const {stdout: lastFrontendVersion} = await getHash('./yarn.lock', './lib/frontend/client/');

	if (latestVersions.backend !== lastBackendVersion) {
		if (!isSetup) {
			console.log('Backend lockfile commit is different, installing dependencies again...');
		}

		await runInstall('.');
		latestVersions.backend = lastBackendVersion;
		hashesChanged = true;
	}

	if (latestVersions.frontend !== lastFrontendVersion) {
		if (!isSetup) {
			console.log('Front end lockfile commit is different, installing dependencies again...');
		}

		await runInstall('./lib/frontend/client/');
		latestVersions.frontend = lastFrontendVersion;
		hashesChanged = true;
	}

	if (hashesChanged) {
		await fs.writeFile(CONFIG, JSON.stringify(latestVersions));
	}
}
