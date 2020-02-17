const {knex} = require('../database');
const analytics = require('../services/analytics');
const errors = require('../errors');
const base = require('./base');

const MODEL_NAME = 'course';

const baseCreate = base.create(MODEL_NAME);
const baseUpdate = base.update(MODEL_NAME);

module.exports = {
	browse: base.browse(MODEL_NAME, (params, options) => {
		if (options.userID) {
			// eslint-disable-next-line camelcase
			params.user_id = options.userID;
		}

		if (options.semester) {
			params.semester = options.semester;
		}
	}),
	read: base.read(MODEL_NAME),
	create(data, transaction, db = null) {
		data.credit_hours = data.credits; // eslint-disable-line camelcase
		delete data.credits;

		return baseCreate(data, transaction, db);
	},
	update(id, responseInstance, data = {}, transaction, db = null) { // eslint-disable-line default-param-last
		if ('credits' in data) {
			data.credit_hours = data.credits; // eslint-disable-line camelcase
			delete data.credits;
		}

		return baseUpdate(id, responseInstance, data, transaction, db);
	},
	async delete(id, db = null) {
		const txn = await knex.instance.transaction();
		try {
			// @todo: determine if we need to add the additional where clause - should be handled by permissions?
			await knex({txn, table: 'grades', db}).where('course_id', id).delete();

			const numCategoriesDeleted = await knex({txn, db, table: 'categories'}).where('course_id', id).delete();

			const numCoursesDeleted = await knex({txn, db, table: 'courses'}).where({id}).delete();

			// Exactly 1 course must be removed
			if (numCoursesDeleted !== 1) {
				throw new errors.InternalServerError({message: 'Failed to remove course'});
			}

			await txn.commit();

			analytics.courseDeleted.add([db, numCoursesDeleted, numCategoriesDeleted]);

			return true;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
