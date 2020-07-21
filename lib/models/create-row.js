const date = require('dayjs');
const objectID = require('bson-objectid');
const {knex} = require('../database');
const {validateRow} = require('../database/validator');
module.exports = class UnsavedDatabaseRow {
	constructor(id = objectID.generate()) {
		// @todo: convert to private fields when the typescript parser supports it
		this._databaseObject = {id};
	}

	get table() {
		throw new Error('table has not been overloaded');
	}

	get columns() {
		throw new Error('columns has not been overloaded');
	}

	get properties() {
		throw new Error('properties has not been overloaded');
	}

	_validate() {
		return validateRow(this.table, this, {method: 'insert'});
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
		if (!this.columns.includes(key) || key === 'id') {
			return;
		}

		this._databaseObject[key] = value;
	}

	get(key) {
		this._precheck();

		if (this.columns.includes(key)) {
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

		await knex({txn, db, table: this.table}).insert(this._databaseObject);

		this._committed = true;
		return this._databaseObject;
	}
};
