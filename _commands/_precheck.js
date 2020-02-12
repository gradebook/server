const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const getHash = require('./utils/get-git-hash.js');
const runInstall = require('./utils/run-yarn-install.js');

const CONFIG = path.resolve(__dirname, '../.gradebook-cli');
const properDir = path.resolve(__dirname, '../');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const MAJOR_MINOR_MATCH = 'v12.15.';

let execa;
try {
	execa = require('execa');
} catch (_) {
	console.error('Please run `yarn install` in the root');
	process.exit(1);
}

module.exports = async function staySafe(isSetup = false) {
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
	const clientLockFileExists = fs.existsSync('./lib/frontend/client/yarn.lock');

	if (!clientLockFileExists && !isSetup) {
		console.error('Submodule `client` not cloned! Run `git submodule init` and try again.');
		process.exit(1);
	}

	// Finally, re-install dependencies if needed
	let latestVersions = {};
	let hashesChanged = false;

	try {
		latestVersions = await readFile(CONFIG);
		latestVersions = JSON.parse(latestVersions);
	} catch {}

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
		await writeFile(CONFIG, JSON.stringify(latestVersions));
	}
};
