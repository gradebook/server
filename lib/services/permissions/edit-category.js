// @ts-check
import {knex} from '../../database/index.js';
import {category} from '../../models/index.js';
import permissionWrap from './wrap.js';

const Model = category.CategoryRow;

export default permissionWrap(async ({user, objectId: id}, db = null) => {
	const category = await knex({db, table: 'categories'}).select(['courses.user_id', 'categories.*'])
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

	delete category.user_id;

	return {status: true, data: new Model(category)};
});
