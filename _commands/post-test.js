// @ts-check
const {sendPayload} = require('@gradebook/actions-hook');

async function doTheWork() {
	try {
		const REQUIRED_KEYS = ['GITHUB_REF', 'GITHUB_REPOSITORY', 'GITHUB_SHA', 'TEST_NAME'];

		for (const key of REQUIRED_KEYS) {
			if (!(key in process.env)) {
				console.warn(`Missing key: ${key}. Not running post-test hook`);
				process.exit(0);
			}
		}

		const branchName = process.env.GITHUB_REF.replace('refs/heads/', '');

		if (branchName.match(/^(dependabot|renovate)/i)) {
			console.log('Dependency update detected. Not running post-test hook');
			return;
		}

		const payload = JSON.stringify({
			codebase: process.env.GITHUB_REPOSITORY,
			commit: process.env.GITHUB_SHA,
			branch: branchName,
			name: process.env.TEST_NAME
		});

		console.log('Sending payload', payload, 'to webhook');
		console.log();
		console.log();

		await sendPayload({
			payload,
			onlyIf: {
				isPush: true,
				branch: 'release'
			}
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

doTheWork();
