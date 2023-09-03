// @ts-check
import schema from '../database/schema.js';
import {snake, unsnake} from '../services/serializers/database-response/user.js';
import {AbstractDatabaseResponse as AbstractDatabaseRow} from './database-response.js';
import {UnsavedDatabaseRow as AbstractNewRow} from './create-row.js';

const TABLE_NAME = 'users';

/* eslint-disable-next-line unicorn/no-array-callback-reference */
const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

export class UserRow extends AbstractDatabaseRow {
	/** @param {string} column */
	transformFromSnakeCase(column) {
		return unsnake(column);
	}

	/** @param {string} column */
	transformToSnakeCase(column) {
		return snake(column);
	}

	get columns() {
		return columns;
	}

	get table() {
		return TABLE_NAME;
	}
}

export class NewUserRow extends AbstractNewRow {
	/** @param {string} column */
	transformFromSnakeCase(column) {
		return unsnake(column);
	}

	/** @param {string} column */
	transformToSnakeCase(column) {
		return snake(column);
	}

	get columns() {
		return columns;
	}

	get properties() {
		return properties;
	}

	get table() {
		return TABLE_NAME;
	}
}

export const response = UserRow;
export const create = NewUserRow;
