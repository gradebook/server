// @ts-check
const {resolve} = require('path');
const chokidar = require('chokidar');

const watcher = chokidar.watch(resolve(__dirname, '../frontend/client/'), {
	followSymlinks: false,
	depth: 2,
	usePolling: false,
	persistent: true,
	ignoreInitial: true,
	ignored: /node_modules|release\/assets/
});

let timer = null;

function scheduleKeepAlive() {
	clearTimeout(timer);

	return setTimeout(() => {
		for (const client of clients) {
			client.write('data: ping\n\n');
		}

		scheduleKeepAlive();
	}, 60000);
}

scheduleKeepAlive();

const clients = new Set();

watcher.on('all', () => {
	timer = scheduleKeepAlive();
	for (const client of clients) {
		client.write('data: change\n\n');
	}
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
module.exports.mount = app => {
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
};
