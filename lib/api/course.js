// @ts-check
const {singularize} = require('@gradebook/fast-pluralize');
const {knex} = require('../database');
const logging = require('../logging');
const ignoredUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const errors = require('../errors');
const {grade: {create: Grade}, category: {create: Category}} = require('../models');
const base = require('./base');

const MODEL_NAME = 'course';

const baseCreate = base.create(MODEL_NAME);

/**
* @typedef {object} CourseBrowseParams
* @property {string} [user]
* @property {string} [semester]
* @property {string[]} [semesters]
*/

/** @type {import('./base-types.d').BrowseFilterFunction<CourseBrowseParams>} */
const applyBrowseFilters = options => {
	const response = {};
	if (options.user) {
		// eslint-disable-next-line camelcase
		response.user_id = options.user;
		delete options.user;
	}

	if (options.semesters) {
		const {semesters} = options;
		delete options.semesters;

		return function filter() {
			this.where(response);
			this.whereIn('semester', semesters);
		};
	}

	if (options.semester) {
		response.semester = options.semester;
		delete options.semester;
	}

	return response;
};

module.exports = {
	/** @type {import('./base-types.d').BrowseResponse<CourseBrowseParams>} */
	browse: base.browse(MODEL_NAME, applyBrowseFilters),
	async browseSemesters(user, db = null) {
		const response = await knex({table: 'courses', db}).distinct('semester').where('user_id', user);
		return response.map(({semester}) => semester);
	},
	read: base.read(MODEL_NAME),
	create: baseCreate,
	async import(data, transaction, db = null) {
		// @todo: verify that this call is correctly extended to allow importing "real" courses (non-template with grades)
		const txn = transaction || await knex.instance.transaction();

		try {
			data.course.user = data.user;

			// Create course
			const course = await baseCreate({data: data.course, txn, db});
			const categories = [];
			// @NOTE: grades can't be inserted async because we depend on the internal positioning of SQL.
			// If in the future we add positions to grades, these can be done out of order since position
			// will be preserved
			const gradeBatches = [[]];
			const promises = [];

			// Create each category with # of grades and add it to list to return
			for (const config of data.categories) {
				// Get the course id
				config.course = course.id;

				if (config.dropped === 0) {
					config.dropped = null;
				}

				const category = new Category();

				for (const prop of category.properties) {
					if (prop in config) {
						category.set(prop, config[prop]);
					}
				}

				// Insert into categories...
				promises.push(category.commit(txn, db));

				const createdCategory = category.json;
				const categoryId = createdCategory.id;
				categories.push(createdCategory);

				createdCategory.grades = [];

				/** @param {string | null} name */
				const createGrade = name => {
					const grade = new Grade();
					grade.set('user', data.user);
					grade.set('course', course.id);
					grade.set('category', categoryId);
					grade.set('name', name);
					return grade;
				};

				// If non-expanded, add single grade
				if (config.numGrades === 1) {
					const grade = createGrade(null);
					createdCategory.grades.push(grade.json);
					gradeBatches[0].push(grade);
					continue;
				}

				// Expanded category... add specified amount of grades and assign names
				const nameBase = singularize(config.name);

				for (let i = 1; i <= config.numGrades; i++) {
					const grade = createGrade(`${nameBase} ${i}`);
					createdCategory.grades.push(grade.json);
					if (!gradeBatches[i - 1]) {
						gradeBatches[i - 1] = [];
					}

					gradeBatches[i - 1].push(grade);
				}
			}

			await Promise.all(promises);

			for (const batch of gradeBatches) {
				await Promise.all(batch.map(grade => grade.commit(txn, db))); // eslint-disable-line no-await-in-loop
			}

			// CASE: transaction was NOT supplied -> it's ours, commit it
			if (!transaction) {
				await txn.commit();
			}

			return {course, categories};
		} catch (error) {
			// If the transaction is not ours, throw the error and let the owner deal with it
			if (transaction) {
				throw error;
			}

			await txn.rollback();
			logging.error('Unknown import error occurred:');
			logging.error(error);
			return {error};
		}
	},
	update: base.update(MODEL_NAME),
	/**
	 * @param {import('./base-types').DeleteOptions} context
	 * @param {string} user
	 */
	async delete({id, db = null}, user) {
		const txn = await knex.instance.transaction();
		try {
			await knex({txn, table: 'grades', db}).where('course_id', id).delete();

			const numCategoriesDeleted = await knex({txn, db, table: 'categories'}).where('course_id', id).delete();

			const numCoursesDeleted = await knex({txn, db, table: 'courses'}).where({id}).delete();

			// Exactly 1 course must be removed
			if (numCoursesDeleted !== 1) {
				throw new errors.InternalServerError({message: 'Failed to remove course'});
			}

			await txn.commit();

			if (!ignoredUserService.isUserIdIgnored(db, user)) {
				analytics.courseDeleted.add([db, numCoursesDeleted, numCategoriesDeleted]);
			}

			return true;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}
};
