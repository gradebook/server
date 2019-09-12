const knex = require('../../../knex');

module.exports = function shutdown() {
	// Destroy the knex connection (to ensure the process exits of needed)
	knex.destroy();

	// ... and reset application caches
	const root = require.resolve('../../..');
	Object.keys(require.cache).forEach(key => {
		if (key.indexOf(root) >= 0) {
			delete require.cache[key];
		}
	});
};
