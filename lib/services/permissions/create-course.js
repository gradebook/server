// @ts-check
const semesterService = require('@gradebook/time').semester.data;
const {knex} = require('../../database');
const settings = require('../settings');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, semester}, db = null) => {
	if (!semesterService.allowedSemesters.includes(semester)) {
		return {
			___code: 412,
			error: 'Cannot create a course in an inactive semester'
		};
	}

	// eslint-disable-next-line camelcase
	const queryResponse = await knex({table: 'courses', db}).count('id AS count').where({user_id: user, semester});

	const numberOfCourses = queryResponse[0].count;

	// CASE: more courses than allowed in one semester
	if (numberOfCourses >= settings.get('max_courses_per_semester', 7)) {
		return 403;
	}

	return true;
});
