const {courses} = require('../database/schema');
const {knex} = require('../database');
const events = require('../events');
const analytics = require('../services/analytics');
const errors = require('../errors');
const base = require('./base');

const MODEL_NAME = 'course';
const columns = Object.keys(courses);

module.exports = {
	browse: base.browse(MODEL_NAME, (params, [options = {}]) => {
		if (options.userID) {
			// eslint-disable-next-line camelcase
			params.user_id = options.userID;
		}

		if (options.semester) {
			params.semester = options.semester;
		}

		params.status = 1;
	}),
	// @todo: add status filtering
	read: base.read(MODEL_NAME),
	create: base.create(MODEL_NAME, columns),
	update: base.update(MODEL_NAME),
	async delete(id) {
		const txn = await knex.transaction();
		try {
			// @todo: determine if we need to add the additional where clause - should be handled by permissions?
			const numGradesDeleted = await txn('grades').where('course_id', id).delete();

			const numCategoriesDeleted = await txn('categories').where('course_id', id).delete();

			const numCoursesDeleted = await txn('courses').where({id}).delete();

			// Exactly 1 course must be removed
			if (numCoursesDeleted !== 1) {
				throw new errors.InternalServerError({message: 'Failed to remove course'});
			}

			await txn.commit();

			analytics.courseDeleted.add([numCoursesDeleted, numCategoriesDeleted, numGradesDeleted]);

			return true;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
