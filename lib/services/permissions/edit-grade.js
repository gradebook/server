// @ts-check
const semesterService = require('../../services/current-semester');
const {knex} = require('../../database');
const {grade: {response: Model}} = require('../../models');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, objectId: id, forUpdate = false}, db = null) => {
	const grade = await knex({table: 'grades', db}).select(['grades.*', 'courses.semester'])
		.innerJoin('courses', 'grades.course_id', 'courses.id')
		.where('grades.id', id)
		.first();

	// CASE: grade doesn't exist
	if (!grade) {
		return 404;
	}

	// CASE: user does not own grade
	if (grade.user_id !== user) {
		return 404;
	}

	// CASE: category is not in current semester
	if (forUpdate && !semesterService.allowedSemesters.includes(grade.semester)) {
		return {
			___code: 412,
			error: 'Cannot edit a grade in an archived semester'
		};
	}

	delete grade.semester;

	return {status: true, data: new Model(grade)};
});
