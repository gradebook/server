const makeApp = require('../../lib');

module.exports = async () => {
	const {server, app} = await makeApp();
	await new Promise(r => server.close(r));
	return app;
};
