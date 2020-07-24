// @ts-check
const schema = require('../database/schema');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema.grades));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

/** @param {string} key @returns {string} */
function transformToSnakeCase(key) {
	if (key === 'user' || key === 'course' || key === 'category') {
		return `${key}_id`;
	}

	return key;
}

/** @param {string} key @returns {string} */
function transformFromSnakeCase(key) {
	// Matches user_id, course_id, and category_id
	if (key.slice(-3) === '_id') {
		return key.slice(0, -3);
	}

	return key;
}

class GradeRow extends AbstractDatabaseRow {
	get table() {
		return 'grades';
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

class NewGradeRow extends AbstractNewRow {
	get table() {
		return 'grades';
	}

	get columns() {
		return columns;
	}

	get properties() {
		return properties;
	}
}

module.exports = {
	response: GradeRow,
	create: NewGradeRow,
	transformFromSnakeCase,
	transformToSnakeCase
};
