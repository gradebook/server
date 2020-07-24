// @ts-check
const date = require('dayjs');
const {knex} = require('../database');
const {validateRow} = require('../database/validator');
const log = require('../logging');

/**
* @abstract
*/
module.exports = class AbstractDatabaseResponse {
	constructor(responseObject) {
		/** @type {{[s: string]: string}} */
		this._originalObject = responseObject;
		/** @type {{[s: string]: string}} */
		this._diff = {};
	}

	/** @returns {string} */
	get table() {
		throw new Error('table has not been overloaded');
	}

	/** @returns {readonly string[]} */
	get columns() {
		throw new Error('columns has not been overloaded');
	}

	_validate() {
		return validateRow(this.table, this, {method: 'update'});
	}

	/**
	 * @param {string} key
	 * @param {any} value
	 */
	set(key, value) {
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
		return Object.assign({}, this._originalObject, this.diff);
	}

	/** @returns {boolean} */
	get dirty() {
		return Object.keys(this._diff).length > 0;
	}

	/** @returns {object} */
	get diff() {
		return Object.fromEntries(this._diff);
	}

	get(key) {
		if (this.columns.includes(key)) {
			return key in this._diff ? this._diff[key] : this._originalObject[key];
		}

		throw new Error(`Key ${key} does not exist`);
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
	* @param {import('knex').Transaction | false} txn
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
			const context = JSON.stringify({id, diff: this.diff});
			log.error(`Failed validating ${this.table} - ${error.context.join(', ')}, ${context}`);
			throw error;
		}

		if (!this.dirty) {
			const context = JSON.stringify(this.json);
			log.error(`⚠ DatabaseResponse::commit - ${this.table} diff got reset by model validation\n\t ${context}`);
			return {};
		}

		const changes = {...this._diff};

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
			this._originalObject[key] = value;
		}

		this.reset();

		return response;
	}
};
