const {knex} = require('../../database');
const {course: {response: Model}} = require('../../models');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, objectId: id}, db = null) => {
	const course = await knex({db, table: 'courses'}).select('*').where({id}).first();

	// CASE: course does not exist
	if (!course) {
		return 404;
	}

	// CASE: course needs to be deleted
	if (course.status !== 1) {
		return 404;
	}

	// CASE: user is not course owner
	if (course.user_id !== user) {
		return 404;
	}

	return {status: true, data: new Model(course)};
});
