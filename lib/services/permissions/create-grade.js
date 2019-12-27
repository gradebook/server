const debug = require('ghost-ignition').debug('permissions:create-grade');
const {knex} = require('../../database');
const settings = require('../../services/settings');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, course, category}, db = null) => {
	const queryResponse = await knex({table: 'grades', db})
		.select(['user_id', 'course_id'])
		.count('id as count')
		// eslint-disable-next-line camelcase
		.where({category_id: category, course_id: course})
		// Filter for grades (and not categories)
		// Remember: to create a single grade, the request needs to be sent to the
		// put /categories endpoint
		// @todo: Query this and return Precondition Failed
		.whereNotNull('name');

	const {count: numberOfGrades, user_id: owner} = queryResponse[0];

	// CASE: someone tries to create a grade for you
	// CASE: the category does not exist (user will be undefined)
	if (owner !== user) {
		debug('owner !== user', owner, user);
		return 404;
	}

	// CASE: exceeded grade limit
	if (numberOfGrades >= settings.get('max_grades_per_category', 10)) {
		debug('too many grades', numberOfGrades);
		return 403;
	}

	return true;
});
