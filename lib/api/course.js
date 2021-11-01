// @ts-check
const {singularize} = require('@gradebook/fast-pluralize');
const {knex} = require('../database');
const logging = require('../logging');
const ignoredUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const errors = require('../errors');
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

/**
 * @param {import('./course-types').ICategoryConfig[]} categories
 * @param {import('knex').Knex.Transaction} txn
 * @param {string | null} db
 * @param {import('./category')} categoryApi
 * @param {string} courseId
 * @param {string} userId
 */
const mapCreateCategoriesToPromises = (categories, txn, db, categoryApi, courseId, userId) => categories.map(config => {
	/** @type {import('./course-types').IInternalCategory} */
	// @ts-expect-error grades won't exist here and we won't clone the object just to make that happen
	const category = config;
	category.course = courseId;
	category.user = userId;

	if (category.dropped === 0) {
		category.dropped = null;
	}

	if ('numGrades' in config) {
		if (config.numGrades === 1) {
			category.grades = [{name: null}];
		} else {
			const nameBase = singularize(config.name);
			category.grades = new Array(config.numGrades); // eslint-disable-line unicorn/no-new-array

			for (let i = 1; i <= config.numGrades; i++) {
				category.grades[i - 1] = {name: `${nameBase} ${i}`};
			}
		}

		delete config.numGrades;
	}

	return categoryApi.create({data: config, txn, db});
});

module.exports = {
	/** @type {import('./base-types.d').BrowseResponse<CourseBrowseParams>} */
	browse: base.browse(MODEL_NAME, applyBrowseFilters),
	/**
	 * @param {string} user
	 * @param {string} db
	 */
	async browseSemesters(user, db = null) {
		const response = await knex({table: 'courses', db}).distinct('semester').where('user_id', user);
		return response.map(({semester}) => semester);
	},
	read: base.read(MODEL_NAME),
	/**
	 * @param {import('./course-types').ICreateCourseData} data
	 * @param {import('knex').Knex.Transaction} [transaction]
	 * @param {string} db
	 */
	async create(data, transaction, db = null) {
		const txn = transaction ?? await knex.instance.transaction();

		try {
			data.course.user = data.user;

			const course = await baseCreate({data: data.course, txn, db});
			const categories = await Promise.all(mapCreateCategoriesToPromises(
				data.categories,
				txn,
				db,
				require('./category'),
				course.id,
				data.user,
			));

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
			logging.error('Unknown create-course error occurred:');
			logging.error(error);
			return {error};
		}
	},
	/**
	 * @param {import('./course-types').ICompleteCourseCreateData} data
	 * @param {string | null} db
	 * @param {import('knex').Knex.Transaction} [transaction]
	 */
	async completeCreate(data, db, transaction) {
		const txn = transaction ?? await knex.instance.transaction();

		try {
			const categories = await Promise.all(mapCreateCategoriesToPromises(
				data.categories,
				txn,
				db,
				require('./category'),
				data.course,
				data.user,
			));

			// CASE: transaction was NOT supplied -> it's ours, commit it
			if (!transaction) {
				await txn.commit();
			}

			return {categories};
		} catch (error) {
			// If the transaction is not ours, throw the error and let the owner deal with it
			if (transaction) {
				throw error;
			}

			await txn.rollback();
			logging.error('Unknown complete-create-course error occurred:');
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

			const numberCategoriesDeleted = await knex({txn, db, table: 'categories'}).where('course_id', id).delete();

			const numberCoursesDeleted = await knex({txn, db, table: 'courses'}).where({id}).delete();

			// Exactly 1 course must be removed
			if (numberCoursesDeleted !== 1) {
				throw new errors.InternalServerError({message: 'Failed to remove course'});
			}

			await txn.commit();

			if (!ignoredUserService.isUserIdIgnored(db, user)) {
				analytics.courseDeleted.add([db, numberCoursesDeleted, numberCategoriesDeleted]);
			}

			return true;
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
};
