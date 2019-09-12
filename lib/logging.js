const {logging} = require('ghost-ignition');
const config = require('./config');

module.exports = logging({
	env: config.get('env'),
	path: config.get('logging.path'),
	mode: config.get('logging.mode'),
	level: config.get('logging.level'),
	domain: config.get('logging.domain'),
	transports: config.get('logging.transports'),
	rotation: config.get('logging.rotation')
});
