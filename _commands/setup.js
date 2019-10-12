const fs = require('fs');
const cp = require('child_process');

const badCP = (...args) => new Promise((resolve, reject) => {
	try {
		const handle = cp.spawn(...args);

		handle.on('exit', (code, signal) => {
			resolve({code, signal});
		});

		handle.on('error', error => {
			reject(error);
		});
	} catch (error) {
		reject(error);
	}
});

function install() {
	console.log('Installing server dependencies');
	return badCP('yarn', ['install']);
}

async function init() {
	const execa = require('execa');

	console.log('Initializing client submodule');
	await execa.command('git submodule init');
	await execa.command('git submodule update');

	console.log('Installing client dependencies');
	const runInstall = require('./utils/run-yarn-install');
	await runInstall('./lib/frontend/client/');

	console.log('Initialized!');
}

async function run() {
	const initialized = fs.existsSync('.gradebook-cli');

	if (initialized && !process.argv.join(' ').includes('--force')) {
		console.log('It looks like you\'ve already run setup. If you want to re-run, use the `--force` flag');
		return;
	}

	await install();

	const precheck = require('./_precheck');

	await precheck(true);
	await init();
}

run();
