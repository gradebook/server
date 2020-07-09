// @ts-check
const debug = require('ghost-ignition').debug('permissions:create-grade');
const {knex} = require('../../database');
const settings = require('../../services/settings');
const semesterService = require('../../services/current-semester');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, course, category}, db = null) => {
	const queryResponse = await knex({table: 'grades', db})
		.select(['grades.user_id', 'grades.course_id', 'courses.semester as semester'])
		.count('grades.id as count')
		.innerJoin('courses', /** @type {import('knex').JoinCallback} */ function limitCourseId() {
			this.on('courses.id', '=', knex.instance.raw('?', [course]));
		})
		// eslint-disable-next-line camelcase
		.where({category_id: category})
		// Filter for grades (and not categories)
		// Remember: to create a single grade, the request needs to be sent to the
		// put /categories endpoint
		// @todo: Query this and return Precondition Failed
		.whereNotNull('grades.name');

	const {count: numberOfGrades, user_id: owner, semester} = queryResponse[0];

	// CASE: someone tries to create a grade for you
	// CASE: the category does not exist (user will be undefined)
	if (owner !== user) {
		debug('owner !== user', owner, user);
		return 404;
	}

	if (!semesterService.validSemesters.has(semester)) {
		return {
			___code: 412,
			error: 'Cannot create a grade for a category in an archived semester'
		};
	}

	// CASE: exceeded grade limit
	if (numberOfGrades >= settings.get('max_grades_per_category', 10)) {
		debug('too many grades', numberOfGrades);
		return 403;
	}

	return true;
});
