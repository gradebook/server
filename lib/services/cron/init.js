// @ts-check
import cron from 'node-cron';
import createDebugger from 'ghost-ignition/lib/debug.js';
import {jobs} from './jobs.js';

const debug = createDebugger('cron');

export const _tasks = [];

export function initializeCron() {
	for (const job of jobs) {
		debug(`Scheduling cron for ${job.name}`);
		_tasks.push(
			cron.schedule(job.schedule, job.function),
		);

		if (job.runImmediate) {
			job.function();
		}
	}
}
