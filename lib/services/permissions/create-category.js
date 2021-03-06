// @ts-check
const debug = require('ghost-ignition').debug('permissions:create-category');
const semesterService = require('@gradebook/time').semester.data;
const {knex} = require('../../database');
const settings = require('../../services/settings');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, course}, db = null) => {
	const queryResponse = await knex({table: 'categories', db})
		.select(['courses.user_id', 'courses.semester as semester'])
		.count('categories.id AS count')
		.innerJoin('courses', {'courses.id': knex.instance.raw('?', course), 'categories.course_id': 'courses.id'});

	let {user_id: owner, count, semester} = queryResponse[0];

	// CASE: Course has no categories
	if (owner === null) {
		const fallbackResponse = await knex({table: 'courses', db})
			.select(['user_id', 'semester'])
			.where({id: course}).first();
		if (!fallbackResponse) {
			return 404;
		}

		owner = fallbackResponse.user_id;
		semester = fallbackResponse.semester;
	}

	// CASE: user does not own course
	// CASE: course does not exist
	if (owner !== user) {
		return 404;
	}

	if (!semesterService.allowedSemesters.includes(semester)) {
		return {
			___code: 412,
			error: 'Cannot create a category for a course in an archived semester'
		};
	}

	// CASE: too many categories created
	if (count >= settings.get('max_categories_per_course', 10)) {
		debug('too many categories', count);
		return 403;
	}

	return true;
});
