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
