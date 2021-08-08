// @ts-check
const semesterService = require('@gradebook/time').semester.data;
const {knex} = require('../../database');
const {category: {response: Model}} = require('../../models');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, objectId: id, forUpdate = false}, db = null) => {
	const category = await knex({db, table: 'categories'}).select(['courses.user_id', 'courses.semester', 'categories.*'])
		.innerJoin('courses', function permissionEditCategoryJoin() {
			this.on('categories.id', '=', knex.instance.raw('?', [id]))
				.andOn('courses.id', 'categories.course_id');
		}).first();

	// CASE: category doesn't exist
	if (!category) {
		return 404;
	}

	// CASE: user does not own category
	if (category.user_id !== user) {
		return 404;
	}

	// CASE: category is not in current semester
	if (forUpdate && !semesterService.allowedSemesters.includes(category.semester)) {
		return {
			___code: 412,
			error: 'Cannot edit a category in an archived semester',
		};
	}

	delete category.semester;
	delete category.user_id;

	return {status: true, data: new Model(category)};
});
