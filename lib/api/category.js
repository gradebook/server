const debug = require('ghost-ignition').debug('api:category');
const {knex} = require('../database');
const errors = require('../errors');
const events = require('../events');
const analytics = require('../services/analytics');
const {grade: {create: Grade}, category: {create: Category}} = require('../models');
const base = require('./base');

const MODEL_NAME = 'category';

const baseRead = base.read(MODEL_NAME);

module.exports = {
	browse: options => {
		const query = knex.select('categories.*').from('categories').orderBy('categories.position');

		const joinParams = {'categories.course_id': 'courses.id'};
		if (options.userID) {
			joinParams['courses.user_id'] = knex.raw('?', [options.userID]);
		}

		if (options.course) {
			joinParams['courses.id'] = knex.raw('?', [options.course]);
		}

		if (options.semester) {
			if (Array.isArray(options.semester)) {
				return query.join('courses', function joinForArray() {
					for (const param in joinParams) {
						if (param in joinParams) {
							this.on(param, joinParams[param]);
						}
					}

					this.onIn('courses.semester', options.semester);
				});
			}

			joinParams['courses.semester'] = knex.raw('?', [options.semester]);
		}

		debug('Sending category.browse query with params', joinParams);
		return query.join('courses', joinParams);
	},
	async read(options) {
		const {includeCourse, id} = options;

		if (!includeCourse) {
			return baseRead(id);
		}

		const joinParams = {
			'categories.course_id': 'courses.id',
			'categories.id': knex.raw('?', [id])
		};

		const cols = [
			'categories.*',
			'courses.id as course_id',
			'courses.user_id',
			'courses.name as course_name',
			'courses.semester'
		];

		debug('Sending category.read query with params', joinParams);
		const response = (await knex.select(cols).from('categories').join('courses', joinParams))[0];

		response.course = {
			id: response.course_id,
			userID: response.user_id,
			name: response.course_name,
			semester: response.semester
		};

		delete response.course_id;
		delete response.user_id;
		delete response.course_name;
		delete response.semester;

		return response;
	},
	async create(data, transaction = false) {
		const CATEGORY_PROPERTIES = ['name', 'weight', 'position', 'course_id'];
		// @note: a non-expanded category has a grade without a name
		const GRADE_PROPERTIES = ['course_id', 'user_id', 'grade'];
		const txn = transaction || await knex.transaction();

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
			await category.commit(txn);

			// Insert into grades...
			await grade.commit(txn);

			const createdCategory = category.json;
			createdCategory.grades = [grade.json];

			// CASE: A transaction was supplied -> don't commit the transaction
			if (transaction === false) {
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
	async delete(category, user) {
		const txn = await knex.transaction();
		try {
			// @todo: determine if we need to add the additional where clause - should be handled by permissions?
			// eslint-disable-next-line camelcase
			const numGradesDeleted = await txn('grades').where({category_id: category, user_id: user}).delete();

			// AT LEAST 1 grade must be removed
			if (numGradesDeleted < 1) {
				throw new errors.InternalServerError({message: 'Failed to remove grade'});
			}

			debug('Sending category.delete query: category', category);
			const numCategoriesDeleted = await txn('categories').where({id: category}).delete();
			await txn.commit();

			if (numCategoriesDeleted > 0) {
				events.emit('category.removed', {id: category});
				analytics.categoryDeleted.add([numCategoriesDeleted]);
				return true;
			}

			return false;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
	async expand(currentCategoryModel, owner) {
		const categoryId = currentCategoryModel.get('id');
		const txn = await knex.transaction();
		try {
			const nameBase = currentCategoryModel.get('name');
			await txn('grades').where('category_id', categoryId).update('name', `${nameBase} 1`);

			const newGrade = new Grade();
			newGrade.set('name', `${nameBase} 2`);
			newGrade.set('user_id', owner);
			newGrade.set('course_id', currentCategoryModel.get('course_id'));
			newGrade.set('category_id', categoryId);
			await newGrade.commit(txn);

			const grades = await txn('grades').select().where('category_id', categoryId);
			await txn.commit();
			analytics.categoryExpanded.add([1]);

			return grades;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
