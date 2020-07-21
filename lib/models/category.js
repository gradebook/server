const schema = require('../database/schema');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema.categories));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

class CategoryRow extends AbstractDatabaseRow {
	get table() {
		return 'categories';
	}

	get columns() {
		return columns;
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
	create: NewCategoryRow
};
