const makeApp = require('../../lib');

module.exports = async () => {
	const {server, app} = await makeApp();
	await new Promise(resolve => server.close(resolve));
	return app;
};
