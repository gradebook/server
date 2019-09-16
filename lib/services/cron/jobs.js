const date = require('dayjs');
const sleep = require('../../utils/sleep');
const events = require('../analytics');
const offset = require('../../utils/timezone-offset');
const {knex} = require('../../database');
const log = require('../../logging');

const hourToRunStatistics = (23 + offset) % 24;

/* eslint-disable func-name-matching */
module.exports = [{
	name: 'statistics',
	//schedule: `58 ${hourToRunStatistics} * * *`, // Every day at 23:58 CST
	schedule: `* * * * *`,
	runImmediate: true,
	function: async function runStatistics() {
		const fullDate = date().add((9+offset), 'hours');
		const requestedDate = fullDate.add(-1, 'days').format('YYYY-MM-DD HH:58:00');
		const weekAgoDate = fullDate.add(-7, 'days').format('YYYY-MM-DD HH:58:00');
		const justDate = fullDate.format('YYYY-MM-DD');
		
		let totalUsers = (await knex('users').count('id as count').first()).count;
		let newUsers = (await knex('users').count('id as count').where('created_at', '>=', requestedDate).first()).count;
		let newUsersLastWeek = (await knex('users').count('id as count').where('created_at', '>=', weekAgoDate).first()).count;
		let totalCourses = (await knex('courses').count('id as count').first()).count;
		let totalCategories = (await knex('categories').count('id as count').first()).count;
		let totalGrades = (await knex('grades').count('id as count').first()).count;
		let allDeletedCourses = await knex('actions').select('data').where('type', '=', 'course.deleted');
		let allDeletedCategories = await knex('actions').select('data').where('type', '=', 'category.deleted');
		
		let deletedCourses = 0;
		let deletedCategories = 0;
		let deletedGrades = 0;

		for (const course of allDeletedCourses){
			let unParsed = course.data;
			let [localCourse, localCat, localGrade] = unParsed.split('|');
			deletedCourses += Number(localCourse);
			deletedCategories += Number(localCat);
			deletedGrades += Number(localGrade);
		}

		for (const category of allDeletedCategories){
			let unParsed = category.data;
			let [localCat, localGrade] = unParsed.split('|');
			deletedCategories += Number(localCat);
			deletedGrades += Number(localGrade);
		}

		try {
			const txn = await knex.transaction();

			const returned = await txn('statistics').insert({date: justDate, totalUsers, newUsers, totalCourses, totalCategories, totalGrades, deletedCourses, deletedCategories, deletedGrades, newUsersLastWeek});
			
			if (returned < 1) {
				log.error(`Failed to insert statistics, response was ${returned}`);
			}

			await txn('actions').whereIn('type', ['category.deleted', 'course.deleted']).delete();

			await txn.commit();
		} catch (error) {
			log.error(`Failed to insert statistics`);
			log.error(error);
		}
	}
}, {
	name: 'flush event buffers',
	schedule: '*/1 * * * *', // Every 5 minutes
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
