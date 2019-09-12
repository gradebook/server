const {knex} = require('../database');

module.exports = {
	delete(options) {
		const {semester, user} = options;

		return knex('courses').where({
			user_id: user, // eslint-disable-line camelcase
			semester: semester.toUpperCase(),
			status: 1
		}).update('status', 0);
	}
};
