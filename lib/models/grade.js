const schema = require('../database/schema');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema.grades));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

class GradeRow extends AbstractDatabaseRow {
	get table() {
		return 'grades';
	}

	get columns() {
		return columns;
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
	create: NewGradeRow
};
