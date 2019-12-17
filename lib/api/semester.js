const {knex} = require('../database');
const analytics = require('../services/analytics');
const errors = require('../errors');

module.exports = {
	delete(options, db = null) {
		const {semester, user} = options;
		const txn = await knex.transaction();

		try {
			const idObjects = await knex({db, txn, table: 'courses'}).select('id').where({
				user_id: user, // eslint-disable-line camelcase
				semester: semester.toUpperCase()
			});

			const ids = idObjects.map(({id}) => id);

			await knex({db, txn, table: 'grades'}).whereIn('course_id', ids).delete();

			const numCategoriesDeleted = await knex({db, txn, table: 'categories'}).whereIn('course_id', ids).delete();

			const numCoursesDeleted = await knex({db, txn, table: 'courses'}).whereIn('id', ids).delete();

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
