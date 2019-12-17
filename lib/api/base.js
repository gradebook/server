const events = require('../events');
const {knex} = require('../database');
const models = require('../models');
const {NotFoundError, InternalServerError} = require('../errors');

const tableMap = {
	course: 'courses',
	category: 'categories',
	grade: 'grades',
	user: 'users'
};

const getTable = dataType => {
	const response = tableMap[dataType];

	if (!response) {
		throw new Error(`Invalid table: ${dataType}`);
	}

	return response;
};

// This should technically be BREAD but BCRUD does the same thing
module.exports = {
	browse(dataType, filter) {
		const table = getTable(dataType);

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

	create(modelName) {
		const Model = models[modelName].create;
		const eventName = `${modelName}.created`;

		if (!Model) {
			throw new Error(`Unknown model ${modelName}`);
		}

		return async (data, transaction, db = null) => {
			const single = new Model();

			for (const key in data) {
				if (Object.hasOwnProperty.call(data, key)) {
					single.set(key, data[key]);
				}
			}

			const response = await single.commit(transaction, db);
			events.emit(eventName, response);
			return response;
		};
	},

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

	update(modelName, additionalValidations = []) {
		const Model = models[modelName].response;

		if (!Model) {
			throw new Error(`Invalid table: ${modelName}`);
		}

		if (!Array.isArray(additionalValidations)) {
			throw new TypeError('Additional validations should be an array');
		}

		const eventName = `${modelName}.changed`;

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
				events.emit(eventName, changeSet);
				return changeSet;
			}

			return {id: responseInstance.get('id')};
		};
	},

	delete(dataType, key = 'id') {
		const table = getTable(dataType);
		const eventName = `${dataType}.removed`;

		return async (value, txn, db = null) => {
			const query = {[key]: value};
			const numDeleted = await knex({table, db, txn}).where(query).delete();

			if (numDeleted > 0) {
				events.emit(eventName, query);
				return true;
			}

			return false;
		};
	}
};
