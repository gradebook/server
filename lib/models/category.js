// @ts-check
const TABLE_NAME = 'categories';
const schema = require('../database/schema');
const serialize = require('../services/serializers/database-response/category');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

// @todo(node) 14.x or when public class properties are available
// Use syntactic sugar in the future
class CategoryRow extends AbstractDatabaseRow {}
AbstractDatabaseRow.overload(CategoryRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(CategoryRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(CategoryRow, 'columns', columns);
AbstractDatabaseRow.overload(CategoryRow, 'table', TABLE_NAME);

class NewCategoryRow extends AbstractNewRow {}
AbstractDatabaseRow.overload(NewCategoryRow, 'columns', columns);
AbstractDatabaseRow.overload(NewCategoryRow, 'properties', properties);
AbstractDatabaseRow.overload(NewCategoryRow, 'table', TABLE_NAME);

module.exports = {
	response: CategoryRow,
	create: NewCategoryRow
};
