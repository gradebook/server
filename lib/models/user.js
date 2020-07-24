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

	transformToSnakeCase(key) {
		// Matches firstName and lastName
		if (key.slice(-4) === 'Name') {
			return `${key.slice(0, -4)}_name`;
		}

		if (key === 'updated' || key === 'created') {
			return `${key}_at`;
		}

		return key;
	}

	transformFromSnakeCase(key) {
		// Matches first_name and last_name
		if (key.slice(-5) === '_name') {
			return `${key.slice(0, -5)}Name`;
		}

		// Matches created_at and updated_at
		if (key.slice(-3) === '_at') {
			return key.slice(0, -3);
		}

		return key;
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
