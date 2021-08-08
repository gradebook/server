// @ts-check
const semesterService = require('@gradebook/time').semester.data;
const {knex} = require('../../database');
const {course: {response: Model}} = require('../../models');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, objectId: id, forUpdate = false}, db = null) => {
	const course = await knex({db, table: 'courses'}).select('*').where({id}).first();

	// CASE: course does not exist
	if (!course) {
		return 404;
	}

	// CASE: user is not course owner
	if (course.user_id !== user) {
		return 404;
	}

	// CASE: category is not in current semester
	if (forUpdate && !semesterService.allowedSemesters.includes(course.semester)) {
		return {
			___code: 412,
			error: 'Cannot edit a course in an archived semester',
		};
	}

	return {status: true, data: new Model(course)};
});
