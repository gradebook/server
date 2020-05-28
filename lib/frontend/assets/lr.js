const SOURCE = '/dev/live-reload';
const LOG_PREFIX = '[LiveReload] ';

const listener = new EventSource(SOURCE);

const log = (...args) => {
	if (typeof args[0] === 'string') {
		args[0] = `${LOG_PREFIX}${args[0]}`;
	} else {
		args.unshift(LOG_PREFIX);
	}

	// eslint-disable-next-line no-console
	console.log(...args);
};

listener.addEventListener('open', () => {
	log('connected');
});

listener.addEventListener('message', message => {
	if (['hello', 'ping'].includes(message.data)) {
		// Noop
	} else if (message.data === 'change') {
		log('Time to refresh');
		window.location.reload();
	} else {
		log('Unknown event: %s', message.data);
	}
});

listener.addEventListener('error', () => {
	if (listener.readyState !== listener.OPEN) {
		log('disconnected');
	}
});
