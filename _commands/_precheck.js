const path = require('path');
const fs = require('fs');
const {promisify} = require('util');

const CONFIG = path.resolve(__dirname, '../.gradebook-cli');
const properDir = path.resolve(__dirname, '../');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);

const MAJOR_MINOR_MATCH = 'v10.16.';

const getHash = (filename, workTree = '.') =>
	execa('git', ['log', '-1', '--pretty=format:% H', '--', filename], {cwd: workTree});

let execa;
try {
	execa = require('execa');
} catch (error) {
	console.error('Please run `yarn install` in the root');
	process.exit(1);
}

module.exports = async function staySafe(isSetup = false) {
	process.chdir(properDir);
	global.gradebook = global.gradebook || {};

	if (!process.version.startsWith(MAJOR_MINOR_MATCH)) {
		console.error(`Node version must be ${MAJOR_MINOR_MATCH}x`);
		process.exit(1);
	}

	let latestVersions = {};
	let hashesChanged = false;

	try {
		latestVersions = await readFile(CONFIG);
		latestVersions = JSON.parse(latestVersions);
	} catch {}

	const {stdout: gitVersion} = await execa('git', ['--version']);

	if (!gitVersion.startsWith('git version 2.')) {
		console.error('Git version 2.x must be installed');
		process.exit(1);
	}

	const clientLockFileExists = await exists('./lib/frontend/client/yarn.lock');

	if (!clientLockFileExists && !isSetup) {
		console.error('Submodule `client` not cloned! Run `git submodule init` and try again.');
		process.exit(1);
	}

	const {stdout: lastBackendVersion} = await getHash('./yarn.lock');
	const {stdout: lastFrontendVersion} = await getHash('./yarn.lock', './lib/frontend/client/');

	if (latestVersions.backend !== lastBackendVersion) {
		console.log('Backend lockfile commit is different, installing dependencies again...');
		await execa.command('yarn install');
		latestVersions.backend = lastBackendVersion;
		global.gradebook.backendChanged = true;
		hashesChanged = true;
	}

	if (latestVersions.frontend !== lastFrontendVersion) {
		console.log('Front end lockfile commit is different, installing dependencies again...');
		await execa.command('yarn --cwd lib/frontend/client install');
		latestVersions.frontend = lastFrontendVersion;
		global.gradebook.frontendChanged = true;
		hashesChanged = true;
	}

	if (hashesChanged) {
		await writeFile(CONFIG, JSON.stringify(latestVersions));
	}
}
