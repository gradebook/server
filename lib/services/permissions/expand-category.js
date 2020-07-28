// @ts-check
const semesterService = require('../../services/current-semester');
const {knex} = require('../../database');
const {category: {response: Model}} = require('../../models');
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

	if (category.name === null) {
		return {
			___code: 412,
			error: 'category name cannot be empty'
		};
	}

	if (category.weight === null) {
		return {
			___code: 412,
			error: 'category weight cannot be empty'
		};
	}

	// CASE: category is already expanded
	if (category.grades > 1) {
		return {
			___code: 412,
			error: 'Category has already been expanded'
		};
	}

	// CASE: category is not in current semester
	if (!semesterService.validSemesters.includes(category.semester)) {
		return {
			___code: 412,
			error: 'Cannot expand a category in an archived semester'
		};
	}

	delete category.semester;
	delete category.grades;

	return {status: true, data: new Model(category)};
});
