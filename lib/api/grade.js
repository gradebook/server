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
const applyBrowseFilters = (params, options = {}) => {
	if (options.user) {
		// eslint-disable-next-line camelcase
		params.user_id = options.user;
	}

	if (options.course) {
		// eslint-disable-next-line camelcase
		params.course_id = options.course;
	}

	if (options.category) {
		// eslint-disable-next-line camelcase
		params.category_id = options.category;
	}

	if (options.inCourse) {
		if (options.inCategory) {
			throw new errors.ValidationError({
				message: 'Cannot filter by course AND category'
			});
		}

		return function whereBuilder() {
			this.where(params);
			// Something's wonky w/ knex types (I think)
			this.whereIn('course_id', options.inCourse);
		};
	}

	if (options.inCategory) {
		return function whereBuilder() {
			this.where(params);
			// Something's wonky w/ knex types (I think)
			this.whereIn('category_id', options.inCategory);
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
