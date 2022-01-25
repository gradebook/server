// @ts-check
import GhostLogger from 'ghost-ignition/lib/logging/GhostLogger.js';
import config from './config.js';

export const logging = new GhostLogger({
	env: config.get('env'),
	path: config.get('logging:path'),
	mode: config.get('logging:mode'),
	level: config.get('logging:level'),
	domain: config.get('logging:domain'),
	transports: config.get('logging:transports'),
	rotation: config.get('logging:rotation'),
});

const realRequestSerializer = logging.serializers.req;

logging.serializers.req = request => {
	const originalObject = realRequestSerializer(request);

	if (request._table) {
		originalObject.domain = request._table;
	}

	return originalObject;
};

export default logging;
