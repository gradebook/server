// @ts-check
import {precheck} from './_precheck.js';

/** @type {import('@gradebook/together')['default']} */
let Together;

try {
	// @TODO: fix this
	({default: {default: Together}} = await import('@gradebook/together'));
} catch {
	console.error('Failed loading @gradebook/together. Try running `yarn install`');
	process.exit(1);
}

/** @type {ConstructorParameters<typeof Together>[0]} */
const commands = [
	['Backend Server', 'yarn backend:dev'],
	['Frontend Builder', 'yarn --cwd lib/frontend/client/ dev'],
];

async function run() {
	await precheck();
	new Together(commands); // eslint-disable-line no-new
}

run();
