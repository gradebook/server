// @ts-check
import schema from '../database/schema.js';
import * as serialize from '../services/serializers/database-response/grade.js';
import {AbstractDatabaseResponse as AbstractDatabaseRow} from './database-response.js';
import {UnsavedDatabaseRow as AbstractNewRow} from './create-row.js';

const TABLE_NAME = 'grades';

/* eslint-disable-next-line unicorn/no-array-callback-reference */
const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

// @todo(node) 14.x or when public class properties are available
// Use syntactic sugar in the future
export class GradeRow extends AbstractDatabaseRow {}
AbstractDatabaseRow.overload(GradeRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(GradeRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(GradeRow, 'columns', columns);
AbstractDatabaseRow.overload(GradeRow, 'table', 'grades');

export class NewGradeRow extends AbstractNewRow {}
AbstractDatabaseRow.overload(NewGradeRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(NewGradeRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(NewGradeRow, 'columns', columns);
AbstractDatabaseRow.overload(NewGradeRow, 'properties', properties);
AbstractDatabaseRow.overload(NewGradeRow, 'table', TABLE_NAME);

export const response = GradeRow;
export const create = NewGradeRow;
