const schema = require('../database/schema');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema.courses));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

class CourseRow extends AbstractDatabaseRow {
	get table() {
		return 'courses';
	}

	get columns() {
		return columns;
	}

	transformToSnakeCase(key) {
		if (key === 'user') {
			return 'user_id';
		}

		if (key === 'credits') {
			return 'credit_hours';
		}

		return key;
	}

	transformFromSnakeCase(key) {
		if (key === 'user_id') {
			return 'user';
		}

		if (key === 'credit_hours') {
			return 'credits';
		}

		return key;
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
	create: NewCourseRow
};
