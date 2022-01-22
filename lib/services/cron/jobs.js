// @ts-check
import {semester} from '@gradebook/time';
import * as events from '../analytics/index.js';

/**
 * @typedef {object} CronJob
 * @property {string} name
 * @property {string} schedule
 * @property {boolean} runImmediate
 * @property {() => any} function
 */

/** @type {CronJob[]} */
export const jobs = [{
	name: 'determine valid semesters',
	schedule: '* */6 * * *', // Every 6 hours,
	runImmediate: false,
	function: semester.computeSemesterData,
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
	},
}];
