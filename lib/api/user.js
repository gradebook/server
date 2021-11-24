// @ts-check
const {dayjs: date} = require('@gradebook/time');
const {knex} = require('../database');
const ignoreUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const {serialize, category, course, grade} = require('../services/serializers/database-response');
const {NotFoundError, ConsistencyError} = require('../errors');
const base = require('./base');

/** @typedef {import('./user-types').UserImport} UserImport */
/** @typedef {import('./user-types').ICourse} IImportCourse */

const MODEL_NAME = 'user';
const baseDelete = base.delete(MODEL_NAME);

// A user is only valid if `total_school_changes` is not null - if it is null, a transfer is in progress
const applyFilters = qb => qb.whereNotNull('total_school_changes');

const api = {
	/**
	 * @param {IImportCourse} course
	 * @param {string} user
	 * @param {string} db
	 * @param {import('knex').Knex.Transaction} txn
	 */
	async _importCourse(course, user, db, txn) {
		const courseApi = require('./course');
		const {categories} = course;
		delete course.categories;
		await courseApi.create({user, course, categories}, db, txn);
	},
	create: base.create(MODEL_NAME, true),
	read: base.read(MODEL_NAME, applyFilters),
	readGid: async (gid, db = null, txn = null) => {
		const user = await applyFilters(knex({db, table: 'users', txn}).select().where({gid}).first());

		if (!user) {
			throw new NotFoundError({message: 'User not found'});
		}

		return user;
	},
	update: base.update(MODEL_NAME),
	/** @param {import('./base-types').MinimumMutableOptions & {id: Gradebook.Request['user']}} context */
	async delete({id: user, db, txn: _txn = null}) {
		const txn = _txn || await knex.instance.transaction();
		await knex({db, txn, table: 'grades'}).where('user_id', user.id).delete();

		// https://github.com/tgriesser/knex/issues/873
		const categoryCount = await knex({db, txn, table: 'categories'})
			.whereIn('course_id', knex({db, txn, table: 'courses'}).where('user_id', user.id).select('id'))
			.delete();

		const courseCount = await knex({db, txn, table: 'courses'}).where('user_id', user.id).delete();

		await baseDelete({id: user.id, db, txn});

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
	 * @param {import('knex').Knex.Transaction} byoTxn
	 */
	async export(user, db, byoTxn = null) {
		const txn = byoTxn ?? await knex.instance.transaction();
		try {
			const courses = await knex({db, txn, table: 'courses'}).select('*').where('user_id', user);
			const courseIDs = courses.map(({id}) => id);

			const categories = await knex({db, txn, table: 'categories'}).select('*').whereIn('course_id', courseIDs);
			const grades = await knex({db, txn, table: 'grades'})
				.select('*').whereIn('course_id', courseIDs).where('user_id', user);

			if (!byoTxn) {
				await txn.commit();
			}

			/* eslint-disable unicorn/no-array-for-each */
			courses.forEach(course_ => serialize(course.unsnake, course_));
			categories.forEach(category_ => serialize(category.unsnake, category_));
			grades.forEach(grade_ => serialize(grade.unsnake, grade_));
			/* eslint-enable unicorn/no-array-for-each */
			return {version: '0', courses, categories, grades};
		} catch (error) {
			if (!byoTxn) {
				await txn.rollback();
			}

			throw error;
		}
	},
	/**
	 * @param {UserImport} import_
	 * @param {string} db
	 * @param {import('knex').Knex.Transaction} txn_
	 */
	import: async (import_, db, txn_) => {
		const txn = txn_ ?? await knex.instance.transaction();

		try {
			const existingUser = await api.readGid(import_.user.gid, db, txn).catch(() => null);

			if (existingUser) {
				throw new ConsistencyError({message: 'User already exists'});
			}

			const createdUser = await api.create({data: import_.user, db, txn});
			await Promise.all(import_.courses.map(course => api._importCourse(course, createdUser.id, db, txn)));

			if (!txn_) {
				await txn_.commit();
			}

			return createdUser;
		} catch (error) {
			if (!txn_) {
				await txn.rollback();
			}

			throw error;
		}
	},
};

module.exports = api;
