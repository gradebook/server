// @ts-check
import schema from '../database/schema.js';
import * as serialize from '../services/serializers/database-response/category.js';
import {AbstractDatabaseResponse as AbstractDatabaseRow} from './database-response.js';
import {UnsavedDatabaseRow as AbstractNewRow} from './create-row.js';

const TABLE_NAME = 'categories';

/* eslint-disable-next-line unicorn/no-array-callback-reference */
const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

// @todo(node) 14.x or when public class properties are available
// Use syntactic sugar in the future
export class CategoryRow extends AbstractDatabaseRow {}
AbstractDatabaseRow.overload(CategoryRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(CategoryRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(CategoryRow, 'columns', columns);
AbstractDatabaseRow.overload(CategoryRow, 'table', TABLE_NAME);

export class NewCategoryRow extends AbstractNewRow {}
AbstractDatabaseRow.overload(NewCategoryRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(NewCategoryRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(NewCategoryRow, 'columns', columns);
AbstractDatabaseRow.overload(NewCategoryRow, 'properties', properties);
AbstractDatabaseRow.overload(NewCategoryRow, 'table', TABLE_NAME);

export const response = CategoryRow;
export const create = NewCategoryRow;
