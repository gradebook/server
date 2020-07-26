// @ts-check
const TABLE_NAME = 'courses';
const schema = require('../database/schema');
const serialize = require('../services/serializers/database-response/course');
const AbstractDatabaseRow = require('./database-response');
const AbstractNewRow = require('./create-row');

const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

// @todo(node) 14.x or when public class properties are available
// Use syntactic sugar in the future
class CourseRow extends AbstractDatabaseRow {}
AbstractDatabaseRow.overload(CourseRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(CourseRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(CourseRow, 'columns', columns);
AbstractDatabaseRow.overload(CourseRow, 'table', TABLE_NAME);

class NewCourseRow extends AbstractNewRow {}
AbstractDatabaseRow.overload(NewCourseRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(NewCourseRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(NewCourseRow, 'columns', columns);
AbstractDatabaseRow.overload(NewCourseRow, 'properties', properties);
AbstractDatabaseRow.overload(NewCourseRow, 'table', TABLE_NAME);

module.exports = {
	response: CourseRow,
	create: NewCourseRow
};
