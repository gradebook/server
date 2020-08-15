// @ts-check
const {knex} = require('../database');
const ignoredUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const errors = require('../errors');

module.exports = {
	/**
	 * @param {{semester: string; user: string; db: string}} context
	 */
	async delete({semester, user, db = null}) {
		const txn = await knex.instance.transaction();

		try {
			const idObjects = await knex({db, txn, table: 'courses'}).select('id').where({
				user_id: user, // eslint-disable-line camelcase
				semester: semester.toUpperCase()
			});

			const ids = idObjects.map(({id}) => id);

			if (ids.length === 0) {
				return 0;
			}

			const numGradesDeleted = await knex({db, txn, table: 'grades'}).whereIn('course_id', ids).delete();

			const numCategoriesDeleted = await knex({db, txn, table: 'categories'}).whereIn('course_id', ids).delete();

			const numCoursesDeleted = await knex({db, txn, table: 'courses'}).whereIn('id', ids).delete();

			// If a grade or category was deleted, the parent course must be deleted as well
			if (numCoursesDeleted < 1 && numCategoriesDeleted + numGradesDeleted > 1) {
				throw new errors.InternalServerError({message: 'Failed to remove course'});
			}

			await txn.commit();

			if (!ignoredUserService.isUserIdIgnored(db, user)) {
				analytics.courseDeleted.add([db, numCoursesDeleted, numCategoriesDeleted]);
			}

			return ids.length + numCategoriesDeleted + numGradesDeleted;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
