const execa = require('execa');
const precheck = require('./_precheck');

const commands = [
	['Backend Server', 'yarn backend:dev'],
	['Frontend Builder', 'yarn --cwd lib/frontend/client/ dev']
];

const children = [];

function teardown() {
	console.log();
	for (const {name, child} of children) {
		console.log('Killing', name);
		child.cancel();
	}
}

function init() {
	process.on('SIGINT', teardown);
	process.on('SIGTERM', teardown);
	for (const [name, command] of commands) {
		console.log('Launching', name);
		const child = execa.command(command, {stdio: 'inherit'});
		children.push({name, child});
	}
}

async function run() {
	await precheck();
	init();
}

run();
