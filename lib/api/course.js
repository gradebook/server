const {singularize} = require('@gradebook/fast-pluralize');
const {knex} = require('../database');
const analytics = require('../services/analytics');
const errors = require('../errors');
const {grade: {create: Grade}, category: {create: Category}} = require('../models');
const base = require('./base');

const MODEL_NAME = 'course';

const baseCreate = base.create(MODEL_NAME);
const baseUpdate = base.update(MODEL_NAME);

module.exports = {
	browse: base.browse(MODEL_NAME, (params, options) => {
		if (options.userID) {
			// eslint-disable-next-line camelcase
			params.user_id = options.userID;
		}

		if (options.semester) {
			params.semester = options.semester;
		}
	}),
	read: base.read(MODEL_NAME),
	create(data, transaction, db = null) {
		data.credit_hours = data.credits; // eslint-disable-line camelcase
		delete data.credits;

		return baseCreate(data, transaction, db);
	},
	async import(data, transaction, db = null) {
		// @todo: verify that this call is correctly extended to allow importing "real" courses (non-template with grades)
		const txn = transaction || await knex.instance.transaction();

		try {
			data.course.user_id = data.user; // eslint-disable-line camelcase
			data.course.credit_hours = data.course.credits; // eslint-disable-line camelcase
			delete data.course.credits;

			// Create course
			const returnedCourse = await baseCreate(data.course, txn, db);
			const returnedCategories = [];

			// Create each category with # of grades and add it to list to return
			for (const category of data.categories) {
				// Get the course id
				category.course_id = returnedCourse.id; // eslint-disable-line camelcase

				category.dropped_grades = category.dropped; // eslint-disable-line camelcase
				delete category.dropped;

				const CATEGORY_PROPERTIES = ['name', 'weight', 'grade', 'position', 'dropped_grades', 'course_id'];
				// @note: a non-expanded category has a grade without a name
				// @note: an expanded category will get assigned a name below
				const GRADE_PROPERTIES = ['course_id', 'user_id', 'grade'];

				const dbCategory = new Category();

				for (const prop of CATEGORY_PROPERTIES) {
					if (prop in category) {
						dbCategory.set(prop, category[prop]);
					}
				}

				// Insert into categories...
				await dbCategory.commit(txn, db);
				const createdCategory = dbCategory.json;
				createdCategory.grades = [];

				// If non-expanded, add single grade
				if (category.numGrades === 1) {
					const dbGrade = new Grade();

					dbGrade.set('user_id', data.userID);
					dbGrade.set('category_id', createdCategory.id);
					dbGrade.set('name', null);

					for (const prop of GRADE_PROPERTIES) {
						if (prop in category) {
							dbGrade.set(prop, category[prop]);
						}
					}

					await dbGrade.commit(txn, db);
					createdCategory.grades.push(dbGrade.json);
				} else {
					// Expanded category... add specified amount of grades and assign names
					const nameBase = singularize(category.name);

					for (let i = 1; i <= category.numGrades; i++) {
						const dbGrade = new Grade();
						dbGrade.set('user_id', data.userID);
						dbGrade.set('category_id', createdCategory.id);
						dbGrade.set('name', `${nameBase} ${i}`);

						for (const prop of GRADE_PROPERTIES) {
							if (prop in category) {
								dbGrade.set(prop, category[prop]);
							}
						}

						// Insert into grades...
						await dbGrade.commit(txn, db);
						createdCategory.grades.push(dbGrade.json);
					}
				}

				returnedCategories.push(createdCategory);
			}

			// CASE: transaction was NOT supplied -> it's ours, commit it
			if (!transaction) {
				await txn.commit();
			}

			return {course: returnedCourse, categories: returnedCategories};
		} catch (error) {
			// If the transaction is not ours, throw the error and let the owner deal with it
			if (transaction) {
				throw error;
			}

			await txn.rollback();
			// @todo: log
			return {error};
		}
	},
	update(id, responseInstance, data = {}, transaction, db = null) { // eslint-disable-line default-param-last
		if ('credits' in data) {
			data.credit_hours = data.credits; // eslint-disable-line camelcase
			delete data.credits;
		}

		return baseUpdate(id, responseInstance, data, transaction, db);
	},
	async delete(id, db = null) {
		const txn = await knex.instance.transaction();
		try {
			// @todo: determine if we need to add the additional where clause - should be handled by permissions?
			await knex({txn, table: 'grades', db}).where('course_id', id).delete();

			const numCategoriesDeleted = await knex({txn, db, table: 'categories'}).where('course_id', id).delete();

			const numCoursesDeleted = await knex({txn, db, table: 'courses'}).where({id}).delete();

			// Exactly 1 course must be removed
			if (numCoursesDeleted !== 1) {
				throw new errors.InternalServerError({message: 'Failed to remove course'});
			}

			await txn.commit();

			analytics.courseDeleted.add([db, numCoursesDeleted, numCategoriesDeleted]);

			return true;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
