const {knex} = require('../database');
const analytics = require('../services/analytics');
const errors = require('../errors');

module.exports = {
	async delete(options) {
		const {semester, user} = options;
		const txn = await knex.transaction();

		try {
			const idObjects = await txn('courses').select('id').where({
				user_id: user, // eslint-disable-line camelcase
				semester: semester.toUpperCase()
			});

			const ids = idObjects.map(({id}) => id);

			await txn('grades').whereIn('course_id', ids).delete();

			const numCategoriesDeleted = await txn('categories').whereIn('course_id', ids).delete();

			const numCoursesDeleted = await txn('courses').whereIn('id', ids).delete();

			// At least 1 course must be removed
			if (numCoursesDeleted < 1) {
				throw new errors.InternalServerError({message: 'Failed to remove course'});
			}

			await txn.commit();

			analytics.courseDeleted.add([numCoursesDeleted, numCategoriesDeleted]);

			return true;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
