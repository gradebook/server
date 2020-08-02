// @ts-check
const debug = require('ghost-ignition').debug('api:category');
const {singularize} = require('@gradebook/fast-pluralize');
const {knex} = require('../database');
const errors = require('../errors');
const ignoredUsersService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const {serialize, category, grade} = require('../services/serializers/database-response');
const {grade: {create: Grade}, category: {create: Category}} = require('../models');
const base = require('./base');

const MODEL_NAME = 'category';

module.exports = {
	/**
	* @type {import('./base-types.d').BrowseResponse<{
		user?: string;
		course?: string;
		courses?: string[];
		semester?: string;
		semesters?: string[];
	}>}
	*/
	async browse(options, db = null) {
		base.assertBrowseFiltersContents(options, false);

		/** @type {import('knex').QueryBuilder} */
		const query = knex({db, table: 'categories'}).select('categories.*').orderBy('categories.position');
		/** @type {[string, any][]} */
		const params = [];
		/** @type {[string, any][]} */
		const joins = [];
		/** @type {[string, any][]} */
		const joinIn = [];
		/** @type {[string, any][]} */
		const paramsIn = [];

		if (options.user) {
			joins.push(['courses.user_id', knex.instance.raw('?', [options.user])]);
			delete options.user;
		}

		if (options.course) {
			params.push(['course_id', knex.instance.raw('?', [options.course])]);
			delete options.course;
		} else if (options.courses) {
			paramsIn.push(['course_id', options.courses]);
			delete options.courses;
		}

		if (options.semester) {
			joins.push(['courses.semester', knex.instance.raw('?', options.semester)]);
			delete options.semester;
		} else if (options.semesters) {
			joinIn.push(['courses.semester', options.semesters]);
			delete options.semesters;
		}

		base.assertBrowseFiltersContents(options, true);

		if (params.length > 0 || paramsIn.length > 0) {
			query.where(function whereBuilder() {
				for (const [column, filter] of params) {
					this.where(column, filter);
				}

				for (const [column, multiFilter] of paramsIn) {
					this.whereIn(column, multiFilter);
				}
			});
		}

		if (joins.length > 0 || joinIn.length > 0) {
			query.join('courses', function joinBuilder() {
				this.on('categories.course_id', 'courses.id');

				for (const [column, filter] of joins) {
					this.on(column, filter);
				}

				for (const [column, multiFilter] of joinIn) {
					this.onIn(column, multiFilter);
				}
			});
		}

		debug('Sending category.browse query with params', {joins, joinIn, paramsIn, params});
		const response = await query;

		return serialize(category.unsnake, response);
	},
	read: base.read(MODEL_NAME),
	async create(data, transaction = null, db = null) {
		const CATEGORY_PROPERTIES = ['name', 'weight', 'position', 'dropped', 'course'];
		// @note: a non-expanded category has a grade without a name
		const GRADE_PROPERTIES = ['course', 'user', 'grade'];
		const txn = transaction || await knex.instance.transaction();

		try {
			const grade = new Grade();
			const category = new Category();

			grade.set('category', category.get('id'));
			grade.set('name', null);

			for (const prop of CATEGORY_PROPERTIES) {
				if (prop in data) {
					category.set(prop, data[prop]);
				}
			}

			for (const prop of GRADE_PROPERTIES) {
				if (prop in data) {
					grade.set(prop, data[prop]);
				}
			}

			// Insert into categories...
			const createdCategory = await category.commit(txn, db);

			// Insert into grades and store
			createdCategory.grades = [await grade.commit(txn, db)];

			// CASE: transaction was NOT supplied -> it's ours, commit it
			if (!transaction) {
				await txn.commit();
			}

			// Possibly select from categories inner join on grades?
			return createdCategory;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
	update: base.update(MODEL_NAME),
	async delete(category, user, db = null) {
		const txn = await knex.instance.transaction();
		try {
			// @todo: determine if we need to add the additional where clause - should be handled by permissions?
			const numGradesDeleted = await knex({txn, table: 'grades', db})
				// eslint-disable-next-line camelcase
				.where({category_id: category, user_id: user}).delete();

			// AT LEAST 1 grade must be removed
			if (numGradesDeleted < 1) {
				throw new errors.InternalServerError({message: 'Failed to remove grade'});
			}

			debug('Sending category.delete query: category', category);
			const numCategoriesDeleted = await knex({txn, table: 'categories', db}).where({id: category}).delete();
			await txn.commit();

			if (numCategoriesDeleted > 0) {
				if (!ignoredUsersService.isUserIdIgnored(db, user)) {
					analytics.categoryDeleted.add([db, numCategoriesDeleted]);
				}

				return true;
			}

			return false;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
	async expand(currentCategoryModel, owner, db = null) {
		const categoryId = currentCategoryModel.get('id');
		const txn = await knex.instance.transaction();
		try {
			const nameBase = singularize(currentCategoryModel.get('name'));
			await knex({txn, table: 'grades', db}).where('category_id', categoryId).update('name', `${nameBase} 1`);

			const newGrade = new Grade();
			newGrade.set('name', `${nameBase} 2`);
			newGrade.set('user', owner);
			newGrade.set('course', currentCategoryModel.get('course'));
			newGrade.set('category', categoryId);
			await newGrade.commit(txn, db);

			const grades = await knex({txn, table: 'grades', db}).select().where('category_id', categoryId);
			await txn.commit();
			if (!ignoredUsersService.isUserIdIgnored(db, owner)) {
				analytics.categoryExpanded.add([db, 1]);
			}

			return serialize(grade.unsnake, grades);
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
	/**
	* @param {string} id
	* @param {number} grade
	* @param {string} db
	*/
	async contract(id, grade, db = null) {
		const txn = await knex.instance.transaction();
		try {
			const dbGrade = await knex({txn, table: 'grades', db}).where('category_id', id).select('id').first();
			await knex({txn, table: 'grades', db}).where('category_id', id).andWhereNot('id', dbGrade.id).delete();
			await knex({txn, table: 'grades', db}).where('id', dbGrade.id).update({name: null, grade});

			await txn.commit();
			return dbGrade.id;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
