// @ts-check
const date = require('dayjs');
const events = require('../analytics');
const offset = require('../../utils/timezone-offset');
const runStatistics = require('../../utils/compute-statistics');
const hostMatches = require('../../services/host');
const log = require('../../logging');

const hourToRunStatistics = (23 + offset) % 24;

module.exports = [{
	name: 'statistics',
	schedule: `58 ${hourToRunStatistics} * * *`, // Every day at 23:58 CST
	// schedule: `*/5 * * * *`,   // Use this line to run statistics every 5 minutes for debugging
	// Keep in mind the statistics table in db is unique on date
	// so you'll have to delete the row manually to allow it to run again
	runImmediate: false,
	async function() {
		const today = date();
		let successes = 0;

		if (!hostMatches) {
			return runStatistics(today);
		}

		for (const [, database] of hostMatches) {
			try {
				// @NOTE: we're running statistics chronologically here since we don't
				// want to exhaust the connection pool for real requests.
				await runStatistics(today.clone(), database); // eslint-disable-line no-await-in-loop
				++successes;
			} catch (error) {
				log.error(`Failed to insert statistics for "${database}":`);
				log.error(error);
			}
		}

		log.info(`Successfully inserted ${successes}/${hostMatches.size} school's statistics`);
	}
}, {
	name: 'flush event buffers',
	schedule: '*/5 * * * *', // Every 5 minutes
	runImmediate: false,
	function: async function flushEventBuffers() {
		await events.userDeleted.commit();
		await events.courseDeleted.commit();
		await events.categoryDeleted.commit();
		await events.gradeDeleted.commit();
		await events.userSession.commit();
	}
}];
