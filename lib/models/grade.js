// @ts-check
const TABLE_NAME = 'grades';
const schema = require('../database/schema');
const serialize = require('../services/serializers/database-response/grade');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

// @todo(node) 14.x or when public class properties are available
// Use syntactic sugar in the future
class GradeRow extends AbstractDatabaseRow {}
AbstractDatabaseRow.overload(GradeRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(GradeRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(GradeRow, 'columns', columns);
AbstractDatabaseRow.overload(GradeRow, 'table', 'grades');

class NewGradeRow extends AbstractNewRow {}
AbstractDatabaseRow.overload(NewGradeRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(NewGradeRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(NewGradeRow, 'columns', columns);
AbstractDatabaseRow.overload(NewGradeRow, 'properties', properties);
AbstractDatabaseRow.overload(NewGradeRow, 'table', TABLE_NAME);

module.exports = {
	response: GradeRow,
	create: NewGradeRow
};
