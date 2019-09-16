const crypto = require('crypto');
const got = require('got');

const REQUIRED_KEYS = ['GITHUB_SHA', 'GITHUB_REF', 'GITHUB_WORKFLOW', 'WEBHOOK_URL', 'WEBHOOK_SECRET'];

for (const key of REQUIRED_KEYS) {
	if (!process.env.hasOwnProperty(key)) {
		console.warn(`Missing key: ${key}. Not running post-test hook`);
		return;
	}
}

const payload = JSON.stringify({
	commit: process.env.GITHUB_SHA,
	branch: process.env.GITHUB_REF.split('/').pop(),
	name: process.env.TEST_NAME
});

const hmac = crypto.createHmac('sha256', Buffer.from(process.env.WEBHOOK_SECRET)).update(payload).digest('hex');

console.log('Sending payload', payload, 'to webhook');

got.post(process.env.WEBHOOK_URL, {
	headers: {
		'X-Actions-Secret': `sha256=${hmac}`,
	},
	body: payload
});
