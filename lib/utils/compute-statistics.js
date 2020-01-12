// @ts-check
const {knex} = require('../database');
const log = require('../logging');

const COURSE_JOIN_CAT = {'courses.id': 'categories.course_id', 'courses.semester': knex.instance.raw('"2020S"')};
const COURSE_JOIN_GRADE = {'courses.id': 'grades.course_id', 'courses.semester': knex.instance.raw('"2020S"')};
const COURSE_JOIN_GRADES_NOT = {'courses.semester': knex.instance.raw('"2020S"'), 'courses.id': 'grades.course_id'};

/**
 * Aggregate statistics for the day
 * @param {import('dayjs').Dayjs} fullDate
 * @param {string} db the database to run statistics against
 */
module.exports = async function runStatistics(fullDate, db = null) {
	const requestedDate = fullDate.add(-1, 'day').format('YYYY-MM-DD HH:58:00');
	const weekAgoDate = fullDate.add(-7, 'day').format('YYYY-MM-DD HH:58:00');
	const justDate = fullDate.add(-1, 'day').format('YYYY-MM-DD');

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
		knex({db, table: 'users'}).count('id as totalUsers').whereNot('isNew', true).first(),
		knex({db, table: 'users'}).count('id as newUsers').whereNot('isNew', true).andWhere('created_at', '>=', requestedDate).first(),
		knex({db, table: 'users'}).count('id as newUsersLastWeek').whereNot('isNew', true).andWhere('created_at', '>=', weekAgoDate).first(),
		knex({db, table: 'users'}).count('id as accessed').whereNot('isNew', true).andWhere('updated_at', '>=', requestedDate).first(),
		knex({db, table: 'users'}).count('id as accessedLastWeek').whereNot('isNew', true).andWhere('updated_at', '>=', weekAgoDate).first(),
		knex({db, table: 'grades'}).count('grades.id as gradesNotInCategories').innerJoin('courses', COURSE_JOIN_GRADES_NOT).whereNull('grades.name').first(),
		knex({db, table: 'courses'}).count('id as totalCourses').where('semester', '2020S').first(),
		knex({db, table: 'categories'}).count('categories.id as totalCategories').innerJoin('courses', COURSE_JOIN_CAT).first(),
		knex({db, table: 'grades'}).count('grades.id as totalGrades').innerJoin('courses', COURSE_JOIN_GRADE).first(),
		knex({db, table: 'actions'}).select('data').where('type', '=', 'course.deleted'),
		knex({db, table: 'actions'}).select('data').where('type', '=', 'category.deleted'),
		knex({db, table: 'actions'}).select('data').where('type', '=', 'user.deleted')
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

	const txn = await knex.instance.transaction();

	try {
		await knex({db, txn, table: 'statistics'}).insert({
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

		await knex({db, txn, table: 'actions'}).delete().whereIn('type', ['user.deleted', 'course.deleted', 'category.deleted']);

		await txn.commit();

		log.info('Inserted statistics successfully');
	} catch (error) {
		log.error('Failed to insert statistics');
		log.error(error);
		txn.rollback();
	}
};
