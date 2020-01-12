const {knex} = require('../../database');
const {category: {response: Model}} = require('../../models');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, objectId: id}, db = null) => {
	const category = await knex({db, table: 'categories'}).select(['courses.user_id', 'categories.*'])
		.innerJoin('courses', function permissionDeleteCategoryJoin() {
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

	delete category.user_id;

	return {status: true, data: new Model(category)};
});
