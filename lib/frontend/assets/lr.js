// Intentionally not typechecked
const SOURCE = '/dev/live-reload';
const LOG_PREFIX = '[LiveReload] ';
const DISABLE_KEY = '__dev_disable_lr';

// This is running in the browser
const ls = globalThis.localStorage;

const log = (...args) => {
	if (typeof args[0] === 'string') {
		args[0] = `${LOG_PREFIX}${args[0]}`;
	} else {
		args.unshift(LOG_PREFIX);
	}

	// eslint-disable-next-line no-console
	console.log(...args);
};

globalThis.stopLiveReload = (permanent = false) => {
	if (permanent) {
		log('Disabling LiveReload permanently.');
		ls?.setItem(DISABLE_KEY, 'true');
	} else {
		log('Disabling LiveReload until the next manual reload');
	}

	listener.close();
};

globalThis.disableLiveReload = () => globalThis.stopLiveReload(true);

globalThis.enableLiveReload = () => {
	if (ls?.getItem(DISABLE_KEY)) {
		log('LiveReload is enabled. Please manually refresh the page.');
		ls?.removeItem(DISABLE_KEY);
	} else {
		log('LiveReload is already enabled. Nothing to do.');
	}
};

if (ls?.getItem(DISABLE_KEY)) {
	throw new Error('Live reload is permanently disabled. To enable, run `enableLiveReload()`');
}

const listener = new EventSource(SOURCE);

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
