const date = require('dayjs');
const objectID = require('bson-objectid');
const {knex} = require('../database');
const schema = require('../database/schema');
const {validateRow} = require('../database/validator');

module.exports = function createClassBasedOnSchema(tableName) {
	const tableSchema = schema[tableName];
	if (!tableSchema) {
		throw new Error(`Table ${tableName} does not exist`);
	}

	const columns = Object.keys(tableSchema);

	return class UnsavedDatabaseRow {
		constructor() {
			this.table = tableName;
			// @todo: convert to private fields when the typescript parser supports it
			this._databaseObject = {
				id: objectID.generate()
			};
		}

		_validate() {
			return validateRow(tableName, this, {method: 'insert'});
		}

		_precheck() {
			if (this._committed) {
				throw new Error('Already created');
			}
		}

		get json() {
			return Object.assign({}, this._databaseObject);
		}

		set(key, value) {
			this._precheck();

			// CASE: invalid key
			// CASE: trying to change id (not allowed)
			if (!columns.includes(key) || key === 'id') {
				return;
			}

			this._databaseObject[key] = value;
		}

		get(key) {
			this._precheck();

			if (columns.includes(key)) {
				return this._databaseObject[key];
			}

			throw new Error(`Key ${key} does not exist`);
		}

		async commit(txn = false, db = null) {
			this._precheck();

			const now = date().format('YYYY-MM-DD HH:mm:ss');
			this.set('created_at', now);
			this.set('updated_at', now);

			this._validate();

			await knex({txn, db, table: tableName}).insert(this._databaseObject);

			this._committed = true;
			return this._databaseObject;
		}
	};
};
