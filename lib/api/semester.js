// @ts-check
import {knex} from '../database/index.js';
import {ignoredUsers} from '../services/ignored-users.js';
import * as analytics from '../services/analytics/index.js';
import * as errors from '../errors/index.js';

export const semester = {
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
				await txn.rollback();
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

			if (!ignoredUsers.isUserIdIgnored(db, user)) {
				analytics.courseDeleted.add([db, numberCoursesDeleted, numberCategoriesDeleted]);
			}

			return ids.length + numberCategoriesDeleted + numberGradesDeleted;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
};

export default semester;
