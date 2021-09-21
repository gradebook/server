// @ts-check
const semesterService = require('@gradebook/time').semester.data;
const knex = require('../../database/knex');
const {course: {response: Model}} = require('../../models');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, objectId: id}, db = null) => {
	const course = await knex({db, table: 'courses'})
		.select('courses.*')
		.count('categories.id as categories')
		.leftJoin('categories', 'categories.course_id', 'courses.id')
		.where('courses.id', knex.instance.raw('?', id))
		.first();

	// CASE: course does not exist
	if (!course) {
		return 404;
	}

	// CASE: user is not course owner
	if (course.user_id !== user) {
		return 404;
	}

	// CASE: category is not in current semester
	if (!semesterService.allowedSemesters.includes(course.semester)) {
		return {
			___code: 412,
			error: 'Cannot finish creating a course in an archived semester',
		};
	}

	if (course.categories > 0) {
		return {
			___code: 412,
			error: 'Cannot finish creating a course that already has categories',
		};
	}

	delete course.categories;

	return {status: true, data: new Model(course)};
});
