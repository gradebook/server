let Together;

try {
	Together = require('@gradebook/together').default;
} catch (_) {
	console.error('Failed loading @gradebook/together. Try running `yarn install`');
	process.exit(1);
}

const precheck = require('./_precheck');

const commands = [
	['Backend Server', 'yarn backend:dev'],
	['Frontend Builder', 'yarn --cwd lib/frontend/client/ start']
];

async function run() {
	await precheck();
	new Together(commands); // eslint-disable-line no-new
}

run();
