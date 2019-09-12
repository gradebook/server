const settings = require('./settings');
const listeners = require('./listeners');

module.exports = {
	store: require('./store'),
	settings,
	init: () => {
		listeners.init();
		return settings.init();
	}
};
