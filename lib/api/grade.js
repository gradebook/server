// @ts-check
const errors = require('../errors');
const events = require('../events');
const {knex} = require('../database');
const base = require('./base');

const MODEL_NAME = 'grade';

module.exports = {
	browse: base.browse(MODEL_NAME, (params, options = {}) => {
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
				this.whereIn('course_id', options.inCourse);
			};
		}

		if (options.inCategory) {
			return function whereBuilder() {
				this.where(params);
				this.whereIn('category_id', options.inCategory);
			};
		}
	}),
	read: base.read(MODEL_NAME),
	create: base.create(MODEL_NAME),
	update: base.update(MODEL_NAME),
	delete: base.delete(MODEL_NAME),
	async deleteMultiple(ids, txn = false, db = null) {
		const response = await knex({txn, db, table: 'grades'}).whereIn('id', ids).delete().catch(error => {
			throw new errors.InternalServerError({err: error});
		});

		if (response) {
			for (const id of ids) {
				events.emit('grade.removed', id);
			}

			return true;
		}

		return false;
	}
};
