const Together = require('@gradebook/together').default;
const precheck = require('./_precheck');

const commands = [
	['Backend Server', 'yarn backend:dev'],
	['Frontend Builder', 'yarn --cwd lib/frontend/client/ dev']
];

async function run() {
	await precheck();
	new Together(commands); // eslint-disable-line no-new
}

run();
