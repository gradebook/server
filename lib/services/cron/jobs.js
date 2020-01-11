// @ts-check
const sleep = require('../../utils/sleep');
const events = require('../analytics');
const offset = require('../../utils/timezone-offset');
const runStatistics = require('../../utils/compute-statistics');
const hostMatches = require('../../services/host');

const hourToRunStatistics = (23 + offset) % 24;

module.exports = [{
	name: 'statistics',
	schedule: `58 ${hourToRunStatistics} * * *`, // Every day at 23:58 CST
	// schedule: `*/5 * * * *`,   // Use this line to run statistics every 5 minutes for debugging
	// Keep in mind the statistics table in db is unique on date
	// so you'll have to delete the row manually to allow it to run again
	runImmediate: false,
	async function() {
		if (!hostMatches) {
			return runStatistics();
		}

		const stats = [];
		for (const [, database] of hostMatches) {
			stats.push(runStatistics(database));
		}

		return Promise.all(stats);
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
		await events.userSession.commit();
	}
}];
