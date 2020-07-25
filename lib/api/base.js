// @ts-check
const {knex} = require('../database');
const models = require('../models');
const {NotFoundError, InternalServerError} = require('../errors');

/** @typedef {import('../models/database-response')} AbstractModel */
/** @typedef {import('knex').Transaction} Transaction */
/** @typedef {keyof import('../models')} KnownModels */

const tableMap = {
	course: 'courses',
	category: 'categories',
	grade: 'grades',
	user: 'users'
};

/** @param {string} dataType @returns {string} */
const getTable = dataType => {
	const response = tableMap[dataType];

	if (!response) {
		throw new Error(`Invalid table: ${dataType}`);
	}

	return response;
};

// This should technically be BREAD but BCRUD does the same thing
module.exports = {
	/**
	* @template AllowedFilters
	* @type {import('./base-types.d').BaseBrowse<AllowedFilters>}
	*/
	browse(dataType, filter) {
		const table = getTable(dataType);

		// JSDoc doesn't support extended generics (e.g. T extends object)
		// @ts-ignore
		return (filterOptions = {}, db = null) => {
			let whereParams = {};

			if (typeof filter === 'function') {
				const secondParams = filter(whereParams, filterOptions);
				if (secondParams && secondParams !== whereParams) {
					whereParams = secondParams;
				}
			}

			return knex({table, db}).select().where(whereParams);
		};
	},

	/**
	* @param {KnownModels} modelName
	* @param {boolean} allowSettingId
	* @returns {
			(data: object, transaction: Transaction, db: string) => Promise<object>
		}
	*/
	create(modelName, allowSettingId = false) {
		const Model = models[modelName].create;

		return async (data, transaction, db = null) => {
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

			const response = await single.commit(transaction, db);
			return response;
		};
	},

	/**
	* @param {KnownModels} dataType
	* @returns {
		(id: string, db: string) => Promise<object>
	}
	*/
	read(dataType) {
		const table = getTable(dataType);

		return async (id, db = null) => {
			const object = await knex({table, db}).select('*').where({id}).first();
			if (!object) {
				throw new NotFoundError({message: `${dataType} not found`});
			}

			return object;
		};
	},

	/**
	* @param {KnownModels} modelName
	* @param {(
			(id: string, data: object, model: AbstractModel) => boolean
		)[]} additionalValidations
	* @returns {
			(id: string, model: AbstractModel, data: object, transaction: Transaction, db: string) => Promise<{id: string}>
		}
	*/
	update(modelName, additionalValidations = []) {
		const Model = models[modelName].response;

		if (!Array.isArray(additionalValidations)) {
			throw new TypeError('Additional validations should be an array');
		}

		// @todo: fix
		/* eslint-disable-next-line default-param-last */
		return async (id, responseInstance, data = {}, transaction, db = null) => {
			if (!(responseInstance instanceof Model)) {
				throw new TypeError('responseInstance not instanceof ModelResponse');
			}

			delete data.id;

			for (const col in data) {
				if (Object.hasOwnProperty.call(data, col)) {
					responseInstance.set(col, data[col]);
				}
			}

			try {
				await Promise.all(additionalValidations.map(validation => validation(id, data, responseInstance)));
			} catch (err) { // eslint-disable-line unicorn/catch-error-name
				throw new InternalServerError({err});
			}

			const changeSet = responseInstance.diff;
			const response = await responseInstance.commit(transaction, db);

			// CASE: no rows were modified
			if (!response) {
				return false;
			}

			if (Object.keys(changeSet).length > 0) {
				changeSet.id = responseInstance.get('id');
				return changeSet;
			}

			return {id: responseInstance.get('id')};
		};
	},

	/**
	* @param {KnownModels} dataType
	* @param {string} key - the column to match
	* @returns {
			(value: string, txn: import('knex').Transaction, db: string) => Promise<boolean>
		}
	*/
	delete(dataType, key = 'id') {
		const table = getTable(dataType);

		return async (value, txn, db = null) => {
			const query = {[key]: value};
			const numDeleted = await knex({table, db, txn}).where(query).delete();

			return numDeleted > 0;
		};
	}
};
