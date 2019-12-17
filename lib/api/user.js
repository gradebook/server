const {knex} = require('../database');
const {users} = require('../database/schema');
const analytics = require('../services/analytics');
const base = require('./base');

const MODEL_NAME = 'user';
const columns = Object.keys(users);
const baseDelete = base.delete(MODEL_NAME);

module.exports = {
	create: base.create(MODEL_NAME, columns),
	read: base.read(MODEL_NAME),
	fromGID: async (gid, db = null) => {
		try {
			const queryResponse = await knex({db, table: 'users'}).select('id').where({gid}).first();
			return queryResponse ? queryResponse.id : null;
		} catch (_) {
			return null;
		}
	},
	update: base.update(MODEL_NAME),
	async delete(user, ignoreAnalytics, db = null) {
		const txn = await knex.instance.transaction();
		await knex({txn, table: 'grades', db}).where('user_id', user).delete();

		// https://github.com/tgriesser/knex/issues/873
		const categoryCount = await knex({txn, db, table: 'categories'})
			.whereIn('course_id', knex({txn, db, table: 'courses'}).where('user_id', user).select('id'))
			.delete();

		const courseCount = await knex({txn, db, table: 'courses'}).where('user_id', user).delete();

		await baseDelete(user, txn, db);
		await txn.commit();

		if (!ignoreAnalytics) {
			analytics.userDeleted.add([1, courseCount, categoryCount]);
		}

		return true;
	},
	async export(user, db = null) {
		const txn = await knex.instance.transaction();
		try {
			// eslint-disable-next-line camelcase
			const courses = await knex({txn, table: 'courses', db}).select('*').where({user_id: user, status: 1});
			const courseIDs = courses.map(({id}) => id);

			const categories = await knex({txn, table: 'categories', db}).select('*').whereIn('course_id', courseIDs);
			const grades = await knex({txn, table: 'grades', db})
				.select('*').whereIn('course_id', courseIDs).where('user_id', user);

			await txn.commit();
			return {courses, categories, grades};
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
