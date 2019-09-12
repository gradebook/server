const path = require('path');
const execa = require('execa');
const fs = require('fs');
const {promisify} = require('util');

const CONFIG = path.resolve(__dirname, '../.gradebook-cli');
const properDir = path.resolve(__dirname, '../');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const MAJOR_MINOR_MATCH = 'v10.16.';

const getHash = (filename, workTree = '.') => execa('git', ['log', '-1', '--pretty=format:% H', '--', filename], {cwd: workTree});

module.exports = async function staySafe() {
	process.chdir(properDir);
	global.gradebook = global.gradebook || {};

	if (!process.version.startsWith(MAJOR_MINOR_MATCH)) {
		throw new Error(`Node version must be ${MAJOR_MINOR_MATCH}x`);
	}

	let latestVersions = {};
	let hashesChanged = false;

	try {
		latestVersions = await readFile(CONFIG);
		latestVersions = JSON.parse(latestVersions);
	} catch {}

	const {stdout: gitVersion} = await execa('git', ['--version']);

	if (!gitVersion.startsWith('git version 2.')) {
		throw new Error('Git version 2.x must be installed');
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
