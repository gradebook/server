// @ts-check
import makeApp from '../../lib/index.js';

export async function startTestServer() {
	const {server, app} = await makeApp();
	await new Promise(resolve => {
		server.close(resolve);
	});
	return app;
}
