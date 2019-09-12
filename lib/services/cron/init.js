const debug = require('debug')('agb:cron');
const cron = require('node-cron');
const jobs = require('./jobs');

module.exports = function initializeCron() {
	for (const job of jobs) {
		debug(`Scheduling cron for ${job.name}`);
		cron.schedule(job.schedule, job.function);

		if (job.runImmediate) {
			job.function();
		}
	}
};
