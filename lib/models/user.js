// @ts-check
const TABLE_NAME = 'users';
const schema = require('../database/schema');
const serialize = require('../services/serializers/database-response/user');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

// @todo(node) 14.x or when public class properties are available
// Use syntactic sugar in the future
class UserRow extends AbstractDatabaseRow {}
AbstractDatabaseRow.overload(UserRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(UserRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(UserRow, 'columns', columns);
AbstractDatabaseRow.overload(UserRow, 'table', TABLE_NAME);

class NewUserRow extends AbstractNewRow {}
AbstractDatabaseRow.overload(NewUserRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(NewUserRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(NewUserRow, 'columns', columns);
AbstractDatabaseRow.overload(NewUserRow, 'properties', properties);
AbstractDatabaseRow.overload(NewUserRow, 'table', TABLE_NAME);
module.exports = {
	response: UserRow,
	create: NewUserRow
};
