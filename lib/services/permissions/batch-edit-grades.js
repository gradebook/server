const debug = require('ghost-ignition').debug('permissions:batch-edit-grades');
const {knex} = require('../../database');
const settings = require('../../cache/settings');
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

module.exports = permissionWrap(async ({user, category, create, delete: del, ids}) => {
	const maxGrades = settings.get('max_grades_per_category', 0);

	// CASE: trying to edit more grades than exist in category
	if (ids.length > maxGrades) {
		debug('batch-edit:', ids.length, 'grades but', maxGrades, 'allowed');
		return 400;
	}

	const grades = await knex('grades')
		.select('*')
		.where('category_id', category)
		.andWhere('user_id', user);

	// CASE: category does not exist, or was corrupted
	if (grades.length === 0) {
		return 404;
	}

	const course = grades[0].course_id;

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
			gradeMap[grade.id] = new Model(grade);
		}
	}

	return {status: true, data: {course, gradeMap}};
});
