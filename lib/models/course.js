// @ts-check
import schema from '../database/schema.js';
import * as serialize from '../services/serializers/database-response/course.js';
import {AbstractDatabaseResponse as AbstractDatabaseRow} from './database-response.js';
import {UnsavedDatabaseRow as AbstractNewRow} from './create-row.js';

const TABLE_NAME = 'courses';

/* eslint-disable-next-line unicorn/no-array-callback-reference */
const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

// @todo(node) 14.x or when public class properties are available
// Use syntactic sugar in the future
export class CourseRow extends AbstractDatabaseRow {}
AbstractDatabaseRow.overload(CourseRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(CourseRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(CourseRow, 'columns', columns);
AbstractDatabaseRow.overload(CourseRow, 'table', TABLE_NAME);

export class NewCourseRow extends AbstractNewRow {}
AbstractDatabaseRow.overload(NewCourseRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(NewCourseRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(NewCourseRow, 'columns', columns);
AbstractDatabaseRow.overload(NewCourseRow, 'properties', properties);
AbstractDatabaseRow.overload(NewCourseRow, 'table', TABLE_NAME);

export const response = CourseRow;
export const create = NewCourseRow;
