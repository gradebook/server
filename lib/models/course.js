// @ts-check
const schema = require('../database/schema');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema.courses));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

/** @param {string} key @returns {string} */
function transformToSnakeCase(key) {
	if (key === 'user') {
		return 'user_id';
	}

	if (key === 'credits') {
		return 'credit_hours';
	}

	return key;
}

/** @param {string} key @returns {string} */
function transformFromSnakeCase(key) {
	if (key === 'user_id') {
		return 'user';
	}

	if (key === 'credit_hours') {
		return 'credits';
	}

	return key;
}

class CourseRow extends AbstractDatabaseRow {
	get table() {
		return 'courses';
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

class NewCourseRow extends AbstractNewRow {
	get table() {
		return 'courses';
	}

	get columns() {
		return columns;
	}

	get properties() {
		return properties;
	}
}

module.exports = {
	response: CourseRow,
	create: NewCourseRow,
	transformFromSnakeCase,
	transformToSnakeCase
};
