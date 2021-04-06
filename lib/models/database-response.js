// @ts-check
const {dayjs: date} = require('@gradebook/time');
const {knex} = require('../database');
const validateRow = require('../database/validator');
const {serialize} = require('../services/serializers/database-response');
const log = require('../logging');

module.exports = class AbstractDatabaseResponse {
	/**
	* @param {typeof AbstractDatabaseResponse | typeof import('./create-row')} parent
	* @param {string} key
	* @param {any} value
	*/
	static overload(parent, key, value) {
		Object.defineProperty(parent.prototype, key, {value});
	}

	constructor(responseObject) {
		/** @type {{[s: string]: string}} */
		this._originalObject = serialize(this.transformFromSnakeCase, responseObject, true);
		/** @type {{[s: string]: string}} */
		this._diff = {};
	}

	/** @returns {string} */
	get table() {
		throw new Error('Table has not been overloaded');
	}

	/** @returns {readonly string[]} */
	get columns() {
		throw new Error('Columns has not been overloaded');
	}

	_validate() {
		return validateRow(this.table, this, {method: 'update'});
	}

	_getChangeSet() {
		const {diff} = this;
		return serialize(this.transformToSnakeCase, diff, true);
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
	* @param {string} property
	* @returns {any}
	*/
	get(property) {
		const key = this.transformFromSnakeCase(property);
		if (this.columns.includes(key)) {
			return key in this._diff ? this._diff[key] : this._originalObject[key];
		}

		throw new Error(`Key ${key} does not exist`);
	}

	/**
	 * @param {string} column
	 * @param {any} value
	 */
	set(column, value) {
		const key = this.transformFromSnakeCase(column);
		// CASE: invalid key
		// CASE: trying to change id (not allowed)
		if (!this.columns.includes(key) || key === 'id') {
			return;
		}

		if (this._originalObject[key] === value) {
			delete this._diff[key];
			return;
		}

		this._diff[key] = value;
	}

	/** @returns {object} */
	get json() {
		return {
			...this._originalObject,
			...this._diff
		};
	}

	/** @returns {boolean} */
	get dirty() {
		return Object.keys(this._diff).length > 0;
	}

	/** @returns {object} */
	get diff() {
		return {...this._diff};
	}

	/**
	* @param {string} column
	* @returns {boolean}
	*/
	changed(column) {
		return column in this._diff;
	}

	reset() {
		this._diff = {};
	}

	/**
	* @param {import('knex').Knex.Transaction | false} txn
	* @param {string} db
	*/
	async commit(txn = false, db = null) {
		const now = date().format('YYYY-MM-DD HH:mm:ss');
		this.set('updated_at', now);

		if (!this.dirty) {
			return {};
		}

		const {id} = this._originalObject;

		try {
			this._validate();
		} catch (error) {
			const context = JSON.stringify({id, diff: this._diff});
			log.error(`Failed validating ${this.table} - ${error.context.join(', ')}, ${context}`);
			throw error;
		}

		if (!this.dirty) {
			const context = JSON.stringify(this.json);
			log.error(`⚠ DatabaseResponse::commit - ${this.table} diff got reset by model validation\n\t ${context}`);
			return {};
		}

		const changes = this._getChangeSet();

		let response;

		try {
			response = await knex({db, table: this.table, txn}).update(changes).where({id});
		} catch (error) {
			if (!(error.code === 'ER_LOCK_DEADLOCK' && !txn)) {
				throw error;
			}

			// If we run into a deadlock, and we're not transacting, we can retry immediately...
			// otherwise, we need to bubble the error up and let the transaction issuer retry
			response = await knex({db, table: this.table}).update(changes).where({id});
		}

		for (const [key, value] of Object.entries(changes)) {
			this._originalObject[this.transformFromSnakeCase(key)] = value;
		}

		this.reset();

		return serialize(this.transformFromSnakeCase, response, true);
	}
};
