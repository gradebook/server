// @ts-check
import fs from 'fs';
import cp from 'child_process';
import {precheck} from './_precheck.js';

const badCP = (...args) => new Promise((resolve, reject) => {
	try {
		// @ts-expect-error
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
	console.log('Initializing client submodule');
	const execa = await import('execa').then(mod => mod.default);
	await execa.command('git submodule init');
	await execa.command('git submodule update');

	console.log('Installing client dependencies');
	const {runInstall} = await import('./utils/run-yarn-install.js');
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

	await precheck(true);
	await init();
}

run();
