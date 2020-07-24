// @ts-check
const schema = require('../database/schema');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema.categories));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

/** @param {string} key @returns {string} */
function transformToSnakeCase(key) {
	if (key === 'course') {
		return 'course_id';
	}

	if (key === 'dropped') {
		return 'dropped_grades';
	}

	return key;
}

/** @param {string} key @returns {string} */
function transformFromSnakeCase(key) {
	if (key === 'course_id') {
		return 'course';
	}

	if (key === 'dropped_grades') {
		return 'dropped';
	}

	return key;
}

class CategoryRow extends AbstractDatabaseRow {
	get table() {
		return 'categories';
	}

	get columns() {
		return columns;
	}

	/** @param {string} key @returns {string} */
	transformFromSnakeCase(key) {
		return transformFromSnakeCase(key);
	}

	/** @param {string} key @returns {string} */
	transformToSnakeCase(key) {
		return transformToSnakeCase(key);
	}
}

class NewCategoryRow extends AbstractNewRow {
	get table() {
		return 'categories';
	}

	get columns() {
		return columns;
	}

	get properties() {
		return properties;
	}
}

module.exports = {
	response: CategoryRow,
	create: NewCategoryRow,
	transformFromSnakeCase,
	transformToSnakeCase
};
