const {knex} = require('../../database');
const settings = require('../../cache/settings');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, semester}) => {
	// eslint-disable-next-line camelcase
	const queryResponse = await knex.count('id AS count').from('courses').where({user_id: user, semester});

	const numberOfCourses = queryResponse[0].count;

	// CASE: more courses than allowed in one semester
	if (numberOfCourses >= settings.get('max_courses_per_semester')) {
		return 403;
	}

	return true;
});
