// @ts-check
const debug = require('ghost-ignition').debug('api:category');
const {singularize} = require('@gradebook/fast-pluralize');
const {knex} = require('../database');
const errors = require('../errors');
const ignoredUsersService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const {serialize, category} = require('../services/serializers/database-response');
const {grade: {create: Grade}, category: {create: Category}} = require('../models');
const base = require('./base');

const MODEL_NAME = 'category';

const baseUpdate = base.update(MODEL_NAME);

module.exports = {
	/**
	* @type {import('./base-types.d').BrowseResponse<{
		user?: string;
		course?: string;
		semester?: string | string[];
	}>}
	*/
	async browse(options, db = null) {
		const query = knex({db, table: 'categories'}).select('categories.*').orderBy('categories.position');

		const joinParams = {'categories.course_id': 'courses.id'};
		if (options.user) {
			joinParams['courses.user_id'] = knex.instance.raw('?', [options.user]);
		}

		if (options.course) {
			joinParams['courses.id'] = knex.instance.raw('?', [options.course]);
		}

		if (options.semester) {
			if (Array.isArray(options.semester)) {
				const response = await query.join('courses', function joinForArray() {
					for (const param in joinParams) {
						if (param in joinParams) {
							this.on(param, joinParams[param]);
						}
					}

					this.onIn('courses.semester', options.semester);
				});

				return serialize(category.unsnake, response);
			}

			joinParams['courses.semester'] = knex.instance.raw('?', [options.semester]);
		}

		debug('Sending category.browse query with params', joinParams);
		const response = await query.join('courses', joinParams);
		return serialize(category.unsnake, response);
	},
	read: base.read(MODEL_NAME),
	async create(data, transaction = null, db = null) {
		data.dropped_grades = data.dropped; // eslint-disable-line camelcase
		delete data.dropped;

		const CATEGORY_PROPERTIES = ['name', 'weight', 'position', 'dropped_grades', 'course_id'];
		// @note: a non-expanded category has a grade without a name
		const GRADE_PROPERTIES = ['course_id', 'user_id', 'grade'];
		const txn = transaction || await knex.instance.transaction();

		try {
			const grade = new Grade();
			const category = new Category();

			grade.set('category_id', category.get('id'));
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
			await category.commit(txn, db);

			// Insert into grades...
			await grade.commit(txn, db);

			const createdCategory = category.json;
			createdCategory.grades = [grade.json];

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
	update(id, responseInstance, data = {}, transaction, db = null) { // eslint-disable-line default-param-last
		if ('dropped' in data) {
			data.dropped_grades = data.dropped; // eslint-disable-line camelcase
			delete data.dropped;
		}

		return baseUpdate(id, responseInstance, data, transaction, db);
	},
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
			newGrade.set('user_id', owner);
			newGrade.set('course_id', currentCategoryModel.get('course_id'));
			newGrade.set('category_id', categoryId);
			await newGrade.commit(txn, db);

			const grades = await knex({txn, table: 'grades', db}).select().where('category_id', categoryId);
			await txn.commit();
			if (!ignoredUsersService.isUserIdIgnored(db, owner)) {
				analytics.categoryExpanded.add([db, 1]);
			}

			return grades;
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
