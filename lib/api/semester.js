// @ts-check
const {knex} = require('../database');
const ignoredUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const errors = require('../errors');

module.exports = {
	/**
	 * @param {{semester: string; user: string; db: string}} context
	 */
	async delete({semester, user, db}) {
		const txn = await knex.instance.transaction();

		try {
			const idObjects = await knex({db, txn, table: 'courses'}).select('id').where({
				user_id: user, // eslint-disable-line camelcase
				semester: semester.toUpperCase(),
			});

			const ids = idObjects.map(({id}) => id);

			if (ids.length === 0) {
				return 0;
			}

			const numberGradesDeleted = await knex({db, txn, table: 'grades'}).whereIn('course_id', ids).delete();

			const numberCategoriesDeleted = await knex({db, txn, table: 'categories'}).whereIn('course_id', ids).delete();

			const numberCoursesDeleted = await knex({db, txn, table: 'courses'}).whereIn('id', ids).delete();

			// If a grade or category was deleted, the parent course must be deleted as well
			if (numberCoursesDeleted < 1 && numberCategoriesDeleted + numberGradesDeleted > 1) {
				throw new errors.InternalServerError({message: 'Failed to remove course'});
			}

			await txn.commit();

			if (!ignoredUserService.isUserIdIgnored(db, user)) {
				analytics.courseDeleted.add([db, numberCoursesDeleted, numberCategoriesDeleted]);
			}

			return ids.length + numberCategoriesDeleted + numberGradesDeleted;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
};
