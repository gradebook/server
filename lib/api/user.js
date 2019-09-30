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
	fromGID: async gid => {
		try {
			const queryResponse = await knex.select('id').from('users').where({gid}).first();
			return queryResponse ? queryResponse.id : null;
		} catch (_) {
			return null;
		}
	},
	update: base.update(MODEL_NAME),
	async delete(user) {
		const txn = await knex.transaction();
		await txn('grades').where('user_id', user).delete();

		// https://github.com/tgriesser/knex/issues/873
		const categoryCount = await txn('categories')
			.whereIn('course_id', txn('courses').where('user_id', user).select('id'))
			.delete();

		const courseCount = await txn('courses').where('user_id', user).delete();

		await baseDelete(user, txn);
		await txn.commit();
		analytics.userDeleted.add([1, courseCount, categoryCount]);
		return true;
	},
	async export(user) {
		const txn = await knex.transaction();
		try {
			// eslint-disable-next-line camelcase
			const courses = await txn('courses').select('*').where({user_id: user, status: 1});
			const courseIDs = courses.map(({id}) => id);

			const categories = await txn('categories').select('*').whereIn('course_id', courseIDs);
			const grades = await txn('grades').select('*').whereIn('course_id', courseIDs).where('user_id', user);

			await txn.commit();
			return {courses, categories, grades};
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
