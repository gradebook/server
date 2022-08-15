// @ts-check
import createDebugger from 'ghost-ignition/lib/debug.js';
import {knex} from '../../database/index.js';
import {settings} from '../../services/settings/index.js';
import permissionWrap from './wrap.js';

const debug = createDebugger('permissions:create-category');

export default permissionWrap(async ({user, course}, db = null) => {
	const queryResponse = await knex({table: 'categories', db})
		.select(['courses.user_id'])
		.count('categories.id AS count')
		.innerJoin('courses', {'courses.id': knex.instance.raw('?', course), 'categories.course_id': 'courses.id'});

	let {user_id: owner, count} = queryResponse[0];

	// CASE: Course has no categories
	if (owner === null) {
		const fallbackResponse = await knex({table: 'courses', db})
			.select(['user_id'])
			.where({id: course}).first();
		if (!fallbackResponse) {
			return 404;
		}

		owner = fallbackResponse.user_id;
	}

	// CASE: user does not own course
	// CASE: course does not exist
	if (owner !== user) {
		return 404;
	}

	// CASE: too many categories created
	if (count >= settings.get('max_categories_per_course')) {
		debug('too many categories', count);
		return 403;
	}

	return true;
});
