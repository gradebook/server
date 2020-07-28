// @ts-check
const semesterService = require('../../services/current-semester');
const {knex} = require('../../database');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, objectId: id}, db = null) => {
	const category = await knex({db, table: 'categories'})
		.select(['courses.user_id', 'courses.semester', 'categories.*'])
		.where('categories.id', knex.instance.raw('?', [id]))
		.count('grades.id as grades')
		.innerJoin('courses', 'courses.id', 'categories.course_id')
		.innerJoin('grades', 'grades.category_id', 'categories.id')
		.first();

	// CASE: category doesn't exist
	if (!category) {
		return 404;
	}

	// CASE: user does not own category
	if (category.user_id !== user) {
		return 404;
	}

	// CASE: category is already contracted
	if (category.grades <= 1) {
		return {
			___code: 412,
			error: 'Category is already contracted'
		};
	}

	// CASE: category is not in current semester
	if (!semesterService.allowedSemesters.includes(category.semester)) {
		return {
			___code: 412,
			error: 'Cannot contract a category in an archived semester'
		};
	}

	delete category.semester;
	delete category.user_id;

	return {status: true, data: category};
});
