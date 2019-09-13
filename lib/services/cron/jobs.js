const sleep = require('../../utils/sleep');
const events = require('../analytics');
const offset = require('../../utils/timezone-offset');

const hourToRunStatistics = (23 + offset) % 24;

/* eslint-disable func-name-matching */
module.exports = [{
	name: 'statistics',
	schedule: `30 ${hourToRunStatistics} * * *`, // Every day at 23:30 CST
	runImmediate: true,
	function: async function runStatistics() {
		// // @todo: add stats computing here
		// @const {knex} = require('../database');
		// eslint-disable-next-line no-console
		console.log('Run statistics here');
	}
}, {
	name: 'flush event buffers',
	schedule: '*/5 * * * *', // Every 5 minutes
	runImmediate: false,
	function: async function flushEventBuffers() {
		await events.userDeleted.commit();
		await sleep(1500);
		await events.courseDeleted.commit();
		await sleep(1500);
		await events.categoryDeleted.commit();
		await sleep(1500);
		await events.gradeDeleted.commit();
		await sleep(1500);
		await events.userLoggedIn.commit();
	}
}];
/* eslint-enable func-name-matching */
