// @ts-check
const {knex} = require('../database');
const models = require('../models');
const serializers = require('../services/serializers/database-response');
const {NotFoundError} = require('../errors');
const errors = require('../errors');

/** @typedef {import('./base-types').CreateOptions} CreateOptions */
/** @typedef {import('./base-types').ReadOptions} ReadOptions */
/** @typedef {import('./base-types').UpdateOptions} UpdateOptions */
/** @typedef {import('./base-types').DeleteOptions} DeleteOptions */
/** @typedef {import('knex').Transaction} Transaction */
/** @typedef {keyof import('../models')} KnownModels */

/** @param {string} dataType @returns {'courses' | 'categories' | 'grades' | 'users'} */
const getTable = dataType => {
	if (dataType === 'course') {
		return 'courses';
	}

	if (dataType === 'category') {
		return 'categories';
	}

	if (dataType === 'grade') {
		return 'grades';
	}

	if (dataType === 'user') {
		return 'users';
	}

	throw new Error(`Invalid table: ${dataType}`);
};

const noop = () => ({});

/**
 * @param {object} filters
 * @param {boolean} assertEmpty
 */
function assertBrowseFiltersContents(filters, assertEmpty = true) {
	const keys = Object.keys(filters);
	if ((assertEmpty && keys.length > 0) || (!assertEmpty && keys.length === 0)) {
		throw new errors.BadRequestError({
			message: assertEmpty ? 'Request has unknown filters' : 'Browse requests must have a filter',
			context: assertEmpty ? `Unknown filters: ${keys}` : 'No filters provided'
		});
	}
}

// This should technically be BREAD but BCRUD does the same thing
module.exports = {
	assertBrowseFiltersContents,
	/**
	* @template AllowedFilters
	* @type {import('./base-types.d').BaseBrowse<AllowedFilters, KnownModels>}
	*/
	browse(dataType, applyFilters = noop) {
		const table = getTable(dataType);
		const serializeType = serializers[dataType].unsnake;

		// JSDoc doesn't support extended generics (e.g. T extends object)
		// @ts-ignore
		return async (filterOptions = {}, db = null) => {
			assertBrowseFiltersContents(filterOptions, false);
			const filters = applyFilters(filterOptions);
			assertBrowseFiltersContents(filterOptions, true);

			const response = await knex({table, db}).select().where(filters);
			serializers.serialize(serializeType, response, false);
			return response;
		};
	},

	/**
	* @param {KnownModels} modelName
	* @param {boolean} allowSettingId
	* @returns {(context: CreateOptions) => Promise<object>}
	*/
	create(modelName, allowSettingId = false) {
		const Model = models[modelName].create;

		return async ({data, txn, db = null}) => {
			let single;

			if (allowSettingId && Object.hasOwnProperty.call(data, 'id')) {
				single = new Model(data.id);
				delete data.id;
			} else {
				single = new Model();
			}

			for (const key in data) {
				if (Object.hasOwnProperty.call(data, key)) {
					single.set(key, data[key]);
				}
			}

			const response = await single.commit(txn, db);
			return response;
		};
	},

	/**
	* @param {KnownModels} dataType
	* @returns {(context: ReadOptions) => Promise<object>}
	*/
	read(dataType) {
		const table = getTable(dataType);

		return async ({id, db = null}) => {
			const object = await knex({table, db}).select('*').where({id}).first();
			if (!object) {
				throw new NotFoundError({message: `${dataType} not found`});
			}

			return object;
		};
	},

	/**
	* @param {KnownModels} modelName
	* @returns {(context: UpdateOptions) => Promise<{id: string}>}
	*/
	update(modelName) {
		const Model = models[modelName].response;

		return async ({model, txn, data = {}, db = null}) => {
			if (!(model instanceof Model)) {
				throw new TypeError('responseInstance not instanceof ModelResponse');
			}

			delete data.id;

			for (const col in data) {
				if (Object.hasOwnProperty.call(data, col)) {
					model.set(col, data[col]);
				}
			}

			const changeSet = model.diff;
			const response = await model.commit(txn, db);

			// CASE: no rows were modified
			if (!response) {
				return false;
			}

			if (Object.keys(changeSet).length > 0) {
				changeSet.id = model.get('id');
				return changeSet;
			}

			return {id: model.get('id')};
		};
	},

	/**
	* @param {KnownModels} dataType
	* @param {string} key - the column to match
	* @returns {(context: DeleteOptions) => Promise<boolean>}
	*/
	delete(dataType, key = 'id') {
		const table = getTable(dataType);

		return async ({id, txn, db = null}) => {
			const query = {[key]: id};
			const numDeleted = await knex({table, db, txn}).where(query).delete();

			return numDeleted > 0;
		};
	}
};
