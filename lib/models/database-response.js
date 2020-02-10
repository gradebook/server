// @ts-check
const date = require('dayjs');
const {knex} = require('../database');
const schema = require('../database/schema');
const {validateRow} = require('../database/validator');
const log = require('../logging');

module.exports = function createClassBasedOnSchema(tableName) {
	const tableSchema = schema[tableName];
	if (!tableSchema) {
		throw new Error(`Table ${tableName} does not exist`);
	}

	const columns = Object.keys(tableSchema);

	return class DatabaseResponse {
		constructor(responseObject) {
			this.table = tableName;
			/** @type {Map<string, any>} */
			this._originalObject = new Map(Object.entries(responseObject));
			/** @type {Map<string, any>} */
			this._diff = new Map();
		}

		_validate() {
			return validateRow(tableName, this, {method: 'update'});
		}

		/**
		 * @param {string} key
		 * @param {any} value
		 */
		set(key, value) {
			// CASE: invalid key
			// CASE: trying to change id (not allowed)
			if (!columns.includes(key) || key === 'id') {
				return;
			}

			if (this._originalObject.get(key) === value) {
				this._diff.delete(key);
				return;
			}

			this._diff.set(key, value);
		}

		get json() {
			return Object.assign(Object.fromEntries(this._originalObject), this.diff);
		}

		get dirty() {
			return this._diff.size > 0;
		}

		get diff() {
			return Object.fromEntries(this._diff);
		}

		get(key) {
			if (columns.includes(key)) {
				return this._diff.has(key) ? this._diff.get(key) : this._originalObject.get(key);
			}

			throw new Error(`Key ${key} does not exist`);
		}

		changed(column) {
			return this._diff.has(column);
		}

		reset() {
			this._diff.clear();
		}

		async commit(txn = false, db = null) {
			const now = date().format('YYYY-MM-DD HH:mm:ss');
			this.set('updated_at', now);

			if (!this.dirty) {
				return true;
			}

			const id = this._originalObject.get('id');

			try {
				this._validate();
			} catch (error) {
				const context = JSON.stringify({id, diff: this.diff});
				log.error(`Failed validating ${tableName} - ${error.context.join(', ')}, ${context}`);
				throw error;
			}

			if (!this.dirty) {
				const context = JSON.stringify(this.json);
				log.error(`⚠ DatabaseResponse::commit - ${tableName} diff got reset by model validation\n\t ${context}`);
				return true;
			}

			const changedCols = this.diff;

			let response;

			try {
				response = await knex({db, table: tableName, txn}).update(changedCols).where({id});
			} catch (error) {
				if (!(error.code === 'ER_LOCK_DEADLOCK' && !txn)) {
					throw error;
				}

				// If we run into a deadlock, and we're not transacting, we can retry immediately...
				// otherwise, we need to bubble the error up and let the transaction issuer retry
				response = await knex({db, table: tableName}).update(changedCols).where({id});
			}

			for (const [key, value] of this._diff) {
				this._originalObject.set(key, value);
			}

			this.reset();

			return response;
		}
	};
};
