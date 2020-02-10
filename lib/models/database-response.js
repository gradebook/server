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
			// @todo: convert to private fields when updating to node 12
			this._dirty = false;
			this._changedCount = 0;
			this._originalObject = Object.assign({}, responseObject);
			this._currentObject = Object.assign({}, responseObject);
		}

		_validate() {
			return validateRow(tableName, this, {method: 'update'});
		}

		set(key, value) {
			// CASE: invalid key
			// CASE: trying to change id (not allowed)
			if (!columns.includes(key) || key === 'id') {
				return;
			}

			// CASE: value hasn't changed
			if (this._currentObject[key] === value) {
				return;
			}

			// CASE: setting value back -> remove change
			if (this._originalObject[key] === value) {
				--this._changedCount;
				this._dirty = this._changedCount !== 0;
				this._currentObject[key] = this._originalObject[key];
				return;
			}

			this._currentObject[key] = value;
			++this._changedCount;
			this._dirty = true;
		}

		get json() {
			return Object.assign({}, this._currentObject);
		}

		get diff() {
			const response = Object.assign({}, this._currentObject);
			for (const key in this._currentObject) {
				if (!this.changed(key)) {
					delete response[key];
				}
			}

			return response;
		}

		get(key) {
			if (columns.includes(key)) {
				return this._currentObject[key];
			}

			throw new Error(`Key ${key} does not exist`);
		}

		changed(column) {
			return this._currentObject[column] !== this._originalObject[column];
		}

		reset() {
			this._currentObject = Object.assign({}, this._originalObject);
			this._changedCount = 0;
			this._dirty = false;
		}

		async commit(txn = false, db = null) {
			const now = date().format('YYYY-MM-DD HH:mm:ss');
			this.set('updated_at', now);

			if (!this._dirty) {
				return true;
			}

			const {id} = this._currentObject;

			try {
				this._validate();
			} catch (error) {
				const context = JSON.stringify({id, diff: this.diff});
				log.error(`Failed validating ${tableName} - ${error.context.join(', ')}, ${context}`);
				throw error;
			}

			if (!this._dirty) {
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

			this._dirty = false;
			this._changedCount = 0;
			this._originalObject = Object.assign({}, this._currentObject);
			return response;
		}
	};
};
