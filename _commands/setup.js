// git submodule init; git submodule update

const fs = require('fs').promises;
const precheck = require('./_precheck');

async function init() {
	const initialized = await fs.exists('./.gradebook-cli');

	if (initialized && !process.argv.join(' ').indexOf('--force') > 0) {
		console.log('It looks like you\'ve already run setup. If you want to re-run, use the `--force` flag');
		return;
	}

	console.log('Initializing client module');
	await execa.command('git submodule init');
	await execa.command('git submodule update');

	console.log('Installing client dependencies');
	// @todo DRY with pre-check
	await execa.command('yarn --cwd lib/frontend/client install');

	console.log('Running pre-check because this setup is not optimized');
	await precheck();

	console.log('Initialized!');
}

async function run() {
	await precheck(true);
	await init();
}

run();
