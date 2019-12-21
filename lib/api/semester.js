const {knex} = require('../database');
const analytics = require('../services/analytics');
const errors = require('../errors');

module.exports = {
	async delete(options) {
		const {semester, user} = options;
		const txn = await knex.transaction();
		let numCategoriesDeleted = 0;
		let numCoursesDeleted = 0;

		try {
			const ids = await txn('courses').select('id').where({
				user_id: user, // eslint-disable-line camelcase
				semester: semester.toUpperCase(),
				status: 1
			});

			for (const idObject of ids) {
				const {id} = idObject;
				// @todo: determine if we need to add the additional where clause - should be handled by permissions?
				// eslint-disable-next-line no-await-in-loop
				await txn('grades').where('course_id', id).delete();

				// eslint-disable-next-line no-await-in-loop
				numCategoriesDeleted += await txn('categories').where('course_id', id).delete();

				// eslint-disable-next-line no-await-in-loop
				const localNumCourses = await txn('courses').where({id}).delete();

				// Exactly 1 course must be removed
				if (localNumCourses !== 1) {
					throw new errors.InternalServerError({message: 'Failed to remove course'});
				}

				numCoursesDeleted += localNumCourses;
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
