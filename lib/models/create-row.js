// @ts-check
const date = require('dayjs');
const objectID = require('bson-objectid');
const {knex} = require('../database');
const {validateRow} = require('../database/validator');

module.exports = class UnsavedDatabaseRow {
	constructor(id = objectID.generate()) {
		// @todo: convert to private fields when the typescript parser supports it
		this._databaseObject = {id};
		/** @returns {string} */
		this.table = null;
		/** @returns {readonly string[]} */
		this.columns = null;
		/** @returns {readonly string[]} */
		this.properties = null;
	}

	_validate() {
		return validateRow(this.table, this, {method: 'insert'});
	}

	_precheck() {
		if (this._committed) {
			throw new Error('Already created');
		}
	}

	/** @returns {object} */
	get json() {
		return Object.assign({}, this._databaseObject);
	}

	/**
	* @param {string} key
	* @param {any} value
	*/
	set(key, value) {
		this._precheck();

		// CASE: invalid key
		// CASE: trying to change id (not allowed)
		if (!this.columns.includes(key) || key === 'id') {
			return;
		}

		this._databaseObject[key] = value;
	}

	/**
	* @param {string} key
	* @returns {any}
	*/
	get(key) {
		this._precheck();

		if (this.columns.includes(key)) {
			return this._databaseObject[key];
		}

		throw new Error(`Key ${key} does not exist`);
	}

	/**
	* @param {import('knex').Transaction | false} txn
	* @param {string} db
	*/
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
