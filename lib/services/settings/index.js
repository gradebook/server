// @ts-check
const config = require('../../config');

module.exports.init = async () => {
	const adapterFile = String(config.get('redis')) === 'true' ? './redis-adapter' : './sql-adapter';
	const Adapter = require(adapterFile);

	const singleton = new Adapter();
	await singleton.init();

	module.exports = singleton;
	return singleton;
};

module.exports.get = () => {
	throw new Error('Settings service has not been initialized');
};
