// @ts-check
const debug = require('ghost-ignition').debug('api:category');
const {knex} = require('../database');
const errors = require('../errors');
const ignoredUsersService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const {serialize, category} = require('../services/serializers/database-response');
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
	/** @param {import('./base-types').CreateOptions<any>} context */
	async create({data, txn: transaction = null, db = null}) {
		const {user, course} = data;
		let {grades} = data;
		delete data.user;
		delete data.grades;

		const txn = transaction || await knex.instance.transaction();

		try {
			const category = new Category();

			for (const key in data) {
				if (Object.hasOwnProperty.call(data, key)) {
					category.set(key, data[key]);
				}
			}

			grades = grades.map(properties => {
				const grade = new Grade();
				for (const key in properties) {
					if (Object.hasOwnProperty.call(properties, key)) {
						grade.set(key, properties[key]);
					}
				}

				grade.set('user', user);
				grade.set('course', course);
				grade.set('category', category.get('id'));

				return grade;
			});

			// Insert into categories...
			const createdCategory = await category.commit(txn, db);

			const gradeObjects = [];
			for (const grade of grades) {
				// eslint-disable-next-line no-await-in-loop
				gradeObjects.push(await grade.commit(txn, db));
			}

			// Insert into grades and store
			createdCategory.grades = gradeObjects;

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
	/**
	 * @param {string} category
	 * @param {string} user
	 * @param {string} db
	*/
	async delete(category, user, db = null) {
		const txn = await knex.instance.transaction();
		try {
			// eslint-disable-next-line camelcase
			const numGradesDeleted = await knex({txn, table: 'grades', db}).where({category_id: category}).delete();

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
	}
};
