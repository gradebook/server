const {GhostLogger} = require('ghost-ignition').logging;
const config = require('./config');

const singleton = new GhostLogger({
	env: config.get('env'),
	path: config.get('logging:path'),
	mode: config.get('logging:mode'),
	level: config.get('logging:level'),
	domain: config.get('logging:domain'),
	transports: config.get('logging:transports'),
	rotation: config.get('logging:rotation')
});

const realReqSerializer = singleton.serializers.req;

singleton.serializers.req = req => {
	const originalObject = realReqSerializer(req);

	if (req._table) {
		originalObject.domain = req._table;
	}

	return originalObject;
};

module.exports = singleton;
