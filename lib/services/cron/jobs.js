const date = require('dayjs');
const sleep = require('../../utils/sleep');
const events = require('../analytics');
const offset = require('../../utils/timezone-offset');
const {knex} = require('../../database');
const log = require('../../logging');

const hourToRunStatistics = (23 + offset) % 24;

const COURSE_JOIN_CAT = {'courses.id': 'categories.course_id', 'courses.semester': knex.raw('"2019F"')};
const COURSE_JOIN_GRADE = {'courses.id': 'grades.course_id', 'courses.semester': knex.raw('"2019F"')};
const COURSE_JOIN_GRADES_NOT = {'courses.semester': knex.raw('"2019F"'), 'courses.id': 'grades.course_id'};

module.exports = [{
	name: 'statistics',
	schedule: `58 ${hourToRunStatistics} * * *`, // Every day at 23:58 CST
	// schedule: `*/5 * * * *`,   // Use this line to run statistics every 5 minutes for debugging
	// Keep in mind the statistics table in db is unique on date
	// so you'll have to delete the row manually to allow it to run again
	runImmediate: false,
	function: async function runStatistics() {
		const fullDate = date();
		const requestedDate = fullDate.add(-1, 'days').format('YYYY-MM-DD HH:58:00');
		const weekAgoDate = fullDate.add(-7, 'days').format('YYYY-MM-DD HH:58:00');
		const justDate = (offset > 0) ? fullDate.add(-1, 'days').format('YYYY-MM-DD') : fullDate.format('YYYY-MM-DD');

		const [
			{totalUsers},
			{newUsers},
			{newUsersLastWeek},
			{accessed},
			{accessedLastWeek},
			{gradesNotInCategories},
			{totalCourses},
			{totalCategories},
			{totalGrades},
			allDeletedCourses,
			allDeletedCategories,
			allDeletedUsers
		] = await Promise.all([
			knex('users').count('id as totalUsers').whereNot('isNew', true).first(),
			knex('users').count('id as newUsers').whereNot('isNew', true).andWhere('created_at', '>=', requestedDate).first(),
			knex('users').count('id as newUsersLastWeek').whereNot('isNew', true).andWhere('created_at', '>=', weekAgoDate).first(),
			knex('users').count('id as accessed').whereNot('isNew', true).andWhere('updated_at', '>=', requestedDate).first(),
			knex('users').count('id as accessedLastWeek').whereNot('isNew', true).andWhere('updated_at', '>=', weekAgoDate).first(),
			knex('grades').count('grades.id as gradesNotInCategories').innerJoin('courses', COURSE_JOIN_GRADES_NOT).whereNull('grades.name').first(),
			knex('courses').count('id as totalCourses').where('semester', '2019F').first(),
			knex('categories').count('categories.id as totalCategories').innerJoin('courses', COURSE_JOIN_CAT).first(),
			knex('grades').count('grades.id as totalGrades').innerJoin('courses', COURSE_JOIN_GRADE).first(),
			knex('actions').select('data').where('type', '=', 'course.deleted'),
			knex('actions').select('data').where('type', '=', 'category.deleted'),
			knex('actions').select('data').where('type', '=', 'user.deleted')
		]);

		const categoriesUsed = Number(totalCategories) - Number(gradesNotInCategories);

		let deletedCourses = 0;
		let deletedCategories = 0;
		let deletedUsers = 0;

		for (const user of allDeletedUsers) {
			const unParsed = user.data;
			const [localUser, localCourse, localCat] = unParsed.split('|');
			deletedUsers += Number(localUser);
			deletedCourses += Number(localCourse);
			deletedCategories += Number(localCat);
		}

		for (const course of allDeletedCourses) {
			const unParsed = course.data;
			const [localCourse, localCat] = unParsed.split('|');
			deletedCourses += Number(localCourse);
			deletedCategories += Number(localCat);
		}

		for (const category of allDeletedCategories) {
			const localCat = category.data;
			deletedCategories += Number(localCat);
		}

		const txn = await knex.transaction();

		try {
			await txn('statistics').insert({
				date: justDate,
				totalUsers,
				newUsers,
				accessed,
				accessedLastWeek,
				categoriesUsed,
				totalCourses,
				totalCategories,
				totalGrades,
				deletedCourses,
				deletedCategories,
				newUsersLastWeek,
				deletedUsers
			});

			await txn('actions').delete().whereIn('type', ['user.deleted', 'course.deleted', 'category.deleted']);

			await txn.commit();

			log.info('Inserted statistics successfully');
		} catch (error) {
			log.error('Failed to insert statistics');
			log.error(error);
			txn.rollback();
		}
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
