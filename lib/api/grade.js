// @ts-check
const errors = require('../errors');
const {knex} = require('../database');
const base = require('./base');

const MODEL_NAME = 'grade';

/**
* @typedef {object} GradeBrowseFilters
* @property {string} [user]
* @property {string} [course]
* @property {string} [category]
* @property {string[]} [inCourse]
* @property {string[]} [inCategory]
*/

/** @type {import('./base-types.d').BrowseFilterFunction<GradeBrowseFilters>} */
const applyBrowseFilters = options => {
	const response = {};
	if (options.user) {
		// eslint-disable-next-line camelcase
		response.user_id = options.user;
		delete options.user;
	}

	if (options.course) {
		// eslint-disable-next-line camelcase
		response.course_id = options.course;
		delete options.course;
	}

	if (options.category) {
		// eslint-disable-next-line camelcase
		response.category_id = options.category;
		delete options.category;
	}

	if (options.inCourse) {
		if (options.inCategory) {
			throw new errors.ValidationError({
				message: 'Cannot filter by course AND category'
			});
		}

		const course = options.inCourse;
		delete options.inCourse;

		return function whereBuilder() {
			this.where(response);
			this.whereIn('course_id', course);
		};
	}

	if (options.inCategory) {
		const category = options.inCategory;
		delete options.inCategory;

		return function whereBuilder() {
			this.where(response);
			this.whereIn('category_id', category);
		};
	}
};

module.exports = {
	/** @type {import('./base-types.d').BrowseResponse<GradeBrowseFilters>} */
	browse: base.browse(MODEL_NAME, applyBrowseFilters),
	read: base.read(MODEL_NAME),
	create: base.create(MODEL_NAME),
	update: base.update(MODEL_NAME),
	delete: base.delete(MODEL_NAME),
	async deleteMultiple(ids, txn = false, db = null) {
		const response = await knex({txn, db, table: 'grades'}).whereIn('id', ids).delete().catch(error => {
			throw new errors.InternalServerError({err: error});
		});

		return Boolean(response);
	}
};
