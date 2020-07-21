const schema = require('../database/schema');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema.users));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

class UserRow extends AbstractDatabaseRow {
	get table() {
		return 'users';
	}

	get columns() {
		return columns;
	}
}

class NewUserRow extends AbstractNewRow {
	get table() {
		return 'users';
	}

	get columns() {
		return columns;
	}

	get properties() {
		return properties;
	}
}

module.exports = {
	response: UserRow,
	create: NewUserRow
};
