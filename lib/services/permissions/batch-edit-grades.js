// @ts-check
const debug = require('ghost-ignition').debug('permissions:batch-edit-grades');
const semesterService = require('@gradebook/time').semester.data;
const {knex} = require('../../database');
const settings = require('../../services/settings');
const {grade: {response: Model}} = require('../../models');
const permissionWrap = require('./wrap');

function responseContainsId(id, response) {
	for (const single of response) {
		if (single.id === id) {
			return true;
		}
	}

	return false;
}

module.exports = permissionWrap(async ({user, category, create, delete: del, ids}, db = null) => {
	const maxGrades = settings.get('max_grades_per_category');

	// CASE: trying to edit more grades than exist in category
	if (ids.length > maxGrades) {
		debug('batch-edit:', ids.length, 'grades but', maxGrades, 'allowed');
		return 400;
	}

	const grades = await knex({db, table: 'grades'})
		.select(['grades.*', 'courses.semester'])
		.innerJoin('courses', 'grades.course_id', 'courses.id')
		.where('category_id', category)
		.andWhere('grades.user_id', user);

	// CASE: category does not exist, or was corrupted
	if (grades.length === 0) {
		return 404;
	}

	// CASE: category is not in current semester
	if (!semesterService.allowedSemesters.includes(grades[0].semester)) {
		return {
			___code: 412,
			error: 'Cannot batch edit a category in an archived semester',
		};
	}

	const {course_id: course} = grades[0];

	for (const id of ids) {
		if (!responseContainsId(id, grades)) {
			debug('batch-edit:', ids, 'not included in category...', grades);
			return 400;
		}
	}

	// CASE: would create too many ny grades
	if (grades.length + create.length > maxGrades) {
		debug('too many grades', maxGrades);
		return 403;
	}

	const gradeMap = {};

	for (const grade of grades) {
		if (!del.includes(grade.id)) {
			delete grade.semester;
			gradeMap[grade.id] = new Model(grade);
		}
	}

	return {status: true, data: {course, gradeMap}};
});
