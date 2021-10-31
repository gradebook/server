// @ts-check
const config = require('../../config');

// @ts-expect-error since we're not using esm (where we can use async/await for module loading),
// the types can be a bit off
module.exports.init = async () => {
	const adapterFile = String(config.get('redis')) === 'true' ? './redis-adapter' : './sql-adapter';
	const Adapter = require(adapterFile);

	/** @type {import('./base-adapter')} */
	const singleton = new Adapter();
	await singleton.init();

	module.exports = singleton;
	return singleton;
};

// @ts-expect-error see line 4
module.exports.get = () => {
	throw new Error('Settings service has not been initialized');
};
