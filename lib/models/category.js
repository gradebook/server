// @ts-check
const schema = require('../database/schema');
const serialize = require('../services/serializers/database-response/category');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema.categories).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

class CategoryRow extends AbstractDatabaseRow {
	constructor(obj) {
		super(obj);
		this.columns = columns;
		this.transformFromSnakeCase = serialize.unsnake;
		this.transformToSnakeCase = serialize.snake;
	}

	get table() {
		return 'categories';
	}
}

class NewCategoryRow extends AbstractNewRow {
	constructor(id) {
		super(id);
		this.columns = columns;
		this.properties = properties;
	}

	get table() {
		return 'categories';
	}
}

module.exports = {
	response: CategoryRow,
	create: NewCategoryRow
};
