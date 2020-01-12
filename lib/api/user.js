// @ts-check
const {knex} = require('../database');
const analytics = require('../services/analytics');
const {NotFoundError} = require('../errors');
const base = require('./base');

const MODEL_NAME = 'user';
const baseDelete = base.delete(MODEL_NAME);

module.exports = {
	create: base.create(MODEL_NAME),
	read: base.read(MODEL_NAME),
	readGid: async (gid, db = null) => {
		const user = await knex({db, table: 'users'}).select().where({gid}).first();

		if (!user) {
			throw new NotFoundError({message: 'User not found'});
		}

		return user;
	},
	update: base.update(MODEL_NAME),
	async delete(user, ignoreAnalytics, db = null, _txn = null) {
		const txn = _txn || await knex.instance.transaction();
		await knex({txn, table: 'grades', db}).where('user_id', user).delete();

		// https://github.com/tgriesser/knex/issues/873
		const categoryCount = await knex({txn, db, table: 'categories'})
			.whereIn('course_id', knex({txn, db, table: 'courses'}).where('user_id', user).select('id'))
			.delete();

		const courseCount = await knex({txn, db, table: 'courses'}).where('user_id', user).delete();

		await baseDelete(user, txn, db);

		if (!_txn) {
			await txn.commit();
		}

		// @todo: if we don't own the transaction, and it gets rolled back, we might multi-count here!!!
		if (!ignoreAnalytics) {
			analytics.userDeleted.add([db, 1, courseCount, categoryCount]);
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
