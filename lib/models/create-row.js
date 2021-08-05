// @ts-check
const {dayjs: date} = require('@gradebook/time');
const objectID = require('bson-objectid').default;
const {knex} = require('../database');
const validateRow = require('../database/validator');
const {serialize} = require('../services/serializers/database-response');

module.exports = class UnsavedDatabaseRow {
	// @ts-expect-error https://togithub.com/williamkapke/bson-objectid/issues/38
	constructor(id = objectID().toString()) {
		// @todo: convert to private fields when the typescript parser supports it
		this._databaseObject = {id};
	}

	/** @returns {string} */
	get table() {
		throw new Error('Table was not overloaded');
	}

	/** @returns {readonly string[]} */
	get columns() {
		throw new Error('Columns was not overloaded');
	}

	/** @returns {readonly string[]} */
	get properties() {
		throw new Error('Properties was not overloaded');
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
	* @abstract
	* @param {string} key
	* @returns {string}
	*/
	transformToSnakeCase(key) {
		return key;
	}

	/**
	* @abstract
	* @param {string} key
	* @returns {string}
	*/
	transformFromSnakeCase(key) {
		return key;
	}

	/**
	* @param {string} column
	* @returns {any}
	*/
	get(column) {
		this._precheck();

		const key = this.transformFromSnakeCase(column);

		if (this.columns.includes(key)) {
			return this._databaseObject[key];
		}

		throw new Error(`Key ${key} does not exist`);
	}

	/**
	* @param {string} column
	* @param {any} value
	*/
	set(column, value) {
		this._precheck();

		const key = this.transformFromSnakeCase(column);

		// CASE: invalid key
		// CASE: trying to change id (not allowed)
		if (!this.columns.includes(key) || key === 'id') {
			return;
		}

		this._databaseObject[key] = value;
	}

	/**
	* @param {import('knex').Knex.Transaction | null} txn
	* @param {string | null} db_
	*/
	async commit(txn, db_) {
		// NOTE: we don't use a default parameter here because the database host *must* be provided - otherwise there are
		// nasty edge cases with host matching!
		const db = db_ ?? null;
		this._precheck();

		const now = date().format('YYYY-MM-DD HH:mm:ss');
		this.set('created_at', now);
		this.set('updated_at', now);

		this._validate();

		await knex({txn, db, table: this.table}).insert(
			serialize(this.transformToSnakeCase, {...this._databaseObject}, true)
		);

		this._committed = true;
		return this._databaseObject;
	}
};
