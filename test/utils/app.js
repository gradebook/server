const makeApp = require('../../lib');
const config = require('../../lib/config');

module.exports = async () => {
	const originalLoggingConfig = config.get('logging');
	// Yes, this is hacky. No, it won't be updated - rather than importing an unnecessary dep,
	// Lose performance for one statement in a test
	const newLoggingConfig = JSON.parse(JSON.stringify(originalLoggingConfig));
	newLoggingConfig.transports = [];
	config.update('logging', newLoggingConfig);

	const destroy = () => config.update('logging', originalLoggingConfig);

	const {server, app} = await makeApp();
	server.close();
	return {app, destroy};
};
