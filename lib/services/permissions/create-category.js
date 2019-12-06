const debug = require('ghost-ignition').debug('permissions:create-category');
const {knex} = require('../../database');
const settings = require('../../cache/settings');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, course}) => {
	const queryResponse = await knex
		.select('courses.user_id')
		.count('categories.id AS count')
		.from('categories')
		.innerJoin('courses', {'courses.id': knex.raw('?', course), 'categories.course_id': 'courses.id'});

	let {user_id: owner, count} = queryResponse[0];

	// CASE: Course has no categories
	if (owner === null) {
		const fallbackResponse = await knex('courses').select('user_id').where({id: course}).first();
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
