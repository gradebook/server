const sendPayload = require('@gradebook/actions-hook').default;

async function doTheWork() {
	try {
		const REQUIRED_KEYS = [
			'GITHUB_REPOSITORY',
			'GITHUB_EVENT_NAME',
			'GITHUB_SHA',
			'GITHUB_REF',
			'WEBHOOK_URL',
			'WEBHOOK_SECRET',
			'TEST_NAME'
		];

		for (const key of REQUIRED_KEYS) {
			if (!(key in process.env)) {
				console.warn(`Missing key: ${key}. Not running post-test hook`);
				process.exit(0);
			}
		}

		if (process.env.GITHUB_EVENT_NAME !== 'push') {
			console.warn(`Event ${process.env.GITHUB_EVENT_NAME} was not push, not running post-test hook`);
			process.exit(0);
		}

		// @todo: Update
		if (process.env.GITHUB_REF !== 'refs/heads/release') {
			console.warn(`Ref ${process.env.GITHUB_REF} was not for release branch, not running post-test hook`);
			process.exit(0);
		}

		const payload = JSON.stringify({
			codebase: process.env.GITHUB_REPOSITORY,
			commit: process.env.GITHUB_SHA,
			branch: process.env.GITHUB_REF.split('/').pop(),
			name: process.env.TEST_NAME
		});

		console.log('Sending payload', payload, 'to webhook');
		console.log();
		console.log();

		await sendPayload({payload});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

doTheWork();
