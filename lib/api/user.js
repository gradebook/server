// @ts-check
const {dayjs: date} = require('@gradebook/time');
const {knex} = require('../database');
const ignoreUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const {serialize, category, course, grade} = require('../services/serializers/database-response');
const {NotFoundError} = require('../errors');
const base = require('./base');

const MODEL_NAME = 'user';
const baseDelete = base.delete(MODEL_NAME);

// A user is only valid if `total_school_changes` is not null - if it is null, a transfer is in progress
const applyFilters = qb => qb.whereNotNull('total_school_changes');

module.exports = {
	create: base.create(MODEL_NAME, true),
	read: base.read(MODEL_NAME, applyFilters),
	readGid: async (gid, db = null) => {
		const user = await applyFilters(knex({db, table: 'users'}).select().where({gid}).first());

		if (!user) {
			throw new NotFoundError({message: 'User not found'});
		}

		return user;
	},
	update: base.update(MODEL_NAME),
	/** @param {import('./base-types').MinimumMutableOptions & {id: import('../../global.d').Request['user']}} context */
	async delete({id: user, db = null, txn: _txn = null}) {
		const txn = _txn || await knex.instance.transaction();
		await knex({txn, table: 'grades', db}).where('user_id', user.id).delete();

		// https://github.com/tgriesser/knex/issues/873
		const categoryCount = await knex({txn, db, table: 'categories'})
			.whereIn('course_id', knex({txn, db, table: 'courses'}).where('user_id', user.id).select('id'))
			.delete();

		const courseCount = await knex({txn, db, table: 'courses'}).where('user_id', user.id).delete();

		await baseDelete({id: user.id, txn, db});

		if (!_txn) {
			await txn.commit();
		}

		const cutoffDateTime = date().add(-2, 'hour');
		const createdDateTime = date(user.created_at);
		const isRealUser = cutoffDateTime > createdDateTime;

		// @todo: if we don't own the transaction, and it gets rolled back, we might multi-count here!!!
		if (isRealUser && !ignoreUserService.isUserIdIgnored(db, user.id)) {
			analytics.userDeleted.add([db, 1, courseCount, categoryCount]);
		}

		return true;
	},
	/**
	 * @param {string} user
	 * @param {string} db
	 */
	async export(user, db = null) {
		const txn = await knex.instance.transaction();
		try {
			const courses = await knex({txn, table: 'courses', db}).select('*').where('user_id', user);
			const courseIDs = courses.map(({id}) => id);

			const categories = await knex({txn, table: 'categories', db}).select('*').whereIn('course_id', courseIDs);
			const grades = await knex({txn, table: 'grades', db})
				.select('*').whereIn('course_id', courseIDs).where('user_id', user);

			await txn.commit();
			courses.forEach(course_ => serialize(course.unsnake, course_));
			categories.forEach(category_ => serialize(category.unsnake, category_));
			grades.forEach(grade_ => serialize(grade.unsnake, grade_));
			return {version: '0', courses, categories, grades};
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
