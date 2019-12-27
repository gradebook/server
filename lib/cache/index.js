const listeners = require('./listeners');

module.exports = {
	store: require('./store'),
	init: () => {
		listeners.init()
	}
};
