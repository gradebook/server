// @ts-check
module.exports.init = async () => {
	const Adapter = require('./sql-adapter');

	const singleton = new Adapter();
	await singleton.init();

	module.exports = singleton;
	return singleton;
};

module.exports.get = () => {
	throw new Error('Settings service has not been initialized');
}
