// @ts-check
const {knex} = require('../database');
const config = require('../config');
const offset = require('./timezone-offset.js');

/**
 * Aggregate statistics for the day
 * @param {import('dayjs').Dayjs} fullDate
 * @param {string} db the database to run statistics against
 */
module.exports = async function runStatistics(fullDate, db = null) {
	const blackListedUsers = config.get('ignoredUsersAnalytics');
	const requestedDate = fullDate.add(-1, 'day').format('YYYY-MM-DD HH:58:00');
	const weekAgoDate = fullDate.add(-7, 'day').format('YYYY-MM-DD HH:58:00');
	// If UTC date is ahead of our time zone by up to 12 hours we should log this as the previous day
	const justDate = (offset <= 12) ? fullDate.add(-1, 'day').format('YYYY-MM-DD') : fullDate.format('YYYY-MM-DD');

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
		knex({db, table: 'users'})
			.count('id as totalUsers')
			.whereNotIn('id', blackListedUsers)
			.first(),

		knex({db, table: 'users'})
			.count('id as newUsers')
			.whereNotIn('id', blackListedUsers)
			.andWhere('created_at', '>=', requestedDate)
			.first(),

		knex({db, table: 'users'})
			.count('id as newUsersLastWeek')
			.whereNotIn('id', blackListedUsers)
			.andWhere('created_at', '>=', weekAgoDate)
			.first(),

		knex({db, table: 'users'})
			.count('id as accessed')
			.whereNotIn('id', blackListedUsers)
			.andWhere('updated_at', '>=', requestedDate)
			.first(),

		knex({db, table: 'users'})
			.count('id as accessedLastWeek')
			.whereNotIn('id', blackListedUsers)
			.andWhere('updated_at', '>=', weekAgoDate)
			.first(),

		knex({db, table: 'grades'})
			.count('grades.id as gradesNotInCategories')
			.whereNotIn('grades.user_id', blackListedUsers)
			.innerJoin('courses', qb => {
				qb.on('courses.semester', knex.instance.raw('"2020U"')).andOn('courses.id', 'grades.course_id');
			})
			.whereNull('grades.name')
			.first(),

		knex({db, table: 'courses'})
			.count('courses.id as totalCourses')
			.where('semester', '2020U')
			.innerJoin('users', qb => {
				qb.on('courses.user_id', 'users.id').andOnNotIn('users.id', blackListedUsers);
			})
			.first(),

		knex({db, table: 'categories'})
			.count('categories.id as totalCategories')
			.innerJoin('users', qb => {
				qb.on('courses.user_id', 'users.id').andOnNotIn('users.id', blackListedUsers);
			})
			.innerJoin('courses', qb => {
				qb.on('courses.id', 'categories.course_id').andOn('courses.semester', knex.instance.raw('"2020U"'));
			})
			.first(),

		knex({db, table: 'grades'})
			.count('grades.id as totalGrades')
			.whereNotIn('grades.user_id', blackListedUsers)
			.innerJoin('courses', qb => {
				qb.on('courses.id', 'grades.course_id').andOn('courses.semester', knex.instance.raw('"2020U"'))
			})
			.first(),

		knex({db, table: 'actions'})
			.select('data')
			.where('type', '=', 'course.deleted'),
		knex({db, table: 'actions'})
			.select('data')
			.where('type', '=', 'category.deleted'),
		knex({db, table: 'actions'})
			.select('data')
			.where('type', '=', 'user.deleted')
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
	} catch (error) {
		await txn.rollback();
		throw error;
	}
};
