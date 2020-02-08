const makeApp = require('../../lib');

module.exports = async () => {
	const {server, app} = await makeApp();
	server.close();
	return app;
};
