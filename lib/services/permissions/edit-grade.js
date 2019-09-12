const {knex} = require('../../database');
const {grade: {response: Model}} = require('../../models');
const permissionWrap = require('./wrap');

module.exports = permissionWrap(async ({user, objectId: id}) => {
	const grade = await knex.select('*').from('grades').where({id}).first();

	// CASE: grade doesn't exist
	if (!grade) {
		return 404;
	}

	// CASE: user does not own grade
	if (grade.user_id !== user) {
		return 404;
	}

	return {status: true, data: new Model(grade)};
});
