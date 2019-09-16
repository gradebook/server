const sleep = require('../../utils/sleep');
const events = require('../analytics');
const offset = require('../../utils/timezone-offset');
const {knex} = require('../../database');

const hourToRunStatistics = (23 + offset) % 24;

/* eslint-disable func-name-matching */
module.exports = [{
	name: 'statistics',
	//schedule: `58 ${hourToRunStatistics} * * *`, // Every day at 23:58 CST
	schedule: `* * * * *`,
	runImmediate: true,
	function: async function runStatistics() {
		const fullDate = new Date();
		const date = fullDate.getFullYear() + '-' + (fullDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + '-' + fullDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

		let totalUsers = await knex('users').count();
		totalUsers = totalUsers[0]['count(*)'];

		let newUsers = await knex('users').select('*').where('created_at', '>=', date).count();
		newUsers = newUsers[0]['count(*)'];
		
		let totalCourses = await knex('courses').count();
		totalCourses = totalCourses[0]['count(*)'];

		let totalCategories = await knex('categories').count();
		totalCategories = totalCategories[0]['count(*)'];
		
		let totalGrades = await knex('grades').count();
		totalGrades = totalGrades[0]['count(*)'];
		
		// eslint-disable-next-line no-console
		console.log(date, totalUsers, newUsers, totalCourses, totalCategories, totalGrades);
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
