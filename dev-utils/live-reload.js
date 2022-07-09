// @ts-check
import process from 'process';
import {fileURLToPath} from 'url';
import path from 'path';
import chokidar from 'chokidar';

const clientPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../lib/frontend/client/');

// @NOTE: We can't just watch the release folder because there's no guarantee
// it will always exist. So instead, we have to watch the parent directory
// and filter events
const watcher = chokidar.watch(clientPath, {
	followSymlinks: false,
	depth: 1,
	usePolling: false,
	persistent: true,
	ignoreInitial: true,
	ignored(path) {
		// CASE: exact match => DON'T ignore
		// CASE: not release => DO ignore
		// CASE: release asset => DO ignore
		return path !== clientPath && (!path.includes('/release') || path.includes('/release/assets/'));
	},
});

let keepAliveTimer = null;
let debounceReload = null;
let indexFileExists = true;

function scheduleKeepAlive() {
	clearTimeout(keepAliveTimer);

	return setTimeout(() => {
		for (const client of clients) {
			client.write('data: ping\n\n');
		}

		scheduleKeepAlive();
	}, 50_000);
}

/**
 * @description prevents premature reload requests by debouncing requests for 25ms.
 * The premature reloads usually occur when a batch change is happening (e.g. cleaning the directory),
 * so this should be more than enough time. If we use a longer debounce period, it ends up with a degraded DX
 */
function scheduleChangeEvent() {
	clearTimeout(debounceReload);

	debounceReload = setTimeout(() => {
		if (indexFileExists) {
			keepAliveTimer = scheduleKeepAlive();
			for (const client of clients) {
				client.write('data: change\n\n');
			}
		}
	}, 25);
}

scheduleKeepAlive();

const clients = new Set();

watcher.on('all', (event, data) => {
	if (
		(event === 'unlinkDir' && data.endsWith('release'))
		|| (event === 'unlink' && data.endsWith('release/index.html'))
	) {
		indexFileExists = false;
	} else if ((event === 'change' || event === 'add') && data.endsWith('release/index.html')) {
		if (event === 'add') {
			// Add a 1s delay before emitting - this prevents a double reload if the file is written and then immediately
			// modified. If there's no immediate modification (1s grace period), still trigger a reload
			setTimeout(() => {
				if (!indexFileExists) {
					indexFileExists = true;
					scheduleChangeEvent();
				}
			}, 1000);
		} else {
			indexFileExists = true;
		}
	}

	scheduleChangeEvent();
});

// Nodemon
process.once('SIGUSR2', () => {
	for (const client of clients) {
		client.end();
	}

	process.kill(process.pid, 'SIGUSR2');
});

/**
* @param {import('express').Application} app
*/
export function useLiveReload(app) {
	app.get('/dev/live-reload', (request, response) => {
		response.status(200);
		response.set('connection', 'keep-alive');
		response.set('content-type', 'text/event-stream');
		response.set('cache-control', 'no-cache');

		response.write('data: hello\n\n');

		const disconnect = () => {
			clients.delete(response);
		};

		response.on('close', disconnect);
		response.on('finish', disconnect);

		clients.add(response);
	});
}
