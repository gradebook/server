// @ts-check
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

	// CASE: category is already expanded
	if (category.grades > 1) {
		return 412;
	}

	/* @todo
	// CASE: category is not in current semester
	if (category.semester !== '2020S') {
		return 412;
	}
	*/

	delete category.semester;
	delete category.grades;

	return {status: true, data: new Model(category)};
});