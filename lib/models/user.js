// @ts-check
import schema from '../database/schema.js';
import * as serialize from '../services/serializers/database-response/user.js';
import {AbstractDatabaseResponse as AbstractDatabaseRow} from './database-response.js';
import {UnsavedDatabaseRow as AbstractNewRow} from './create-row.js';

const TABLE_NAME = 'users';

/* eslint-disable-next-line unicorn/no-array-callback-reference */
const columns = Object.freeze(Object.keys(schema[TABLE_NAME]).map(serialize.unsnake));
const properties = Object.freeze(columns.filter(column => column !== 'id'));

// @todo(node) 14.x or when public class properties are available
// Use syntactic sugar in the future
export class UserRow extends AbstractDatabaseRow {}
AbstractDatabaseRow.overload(UserRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(UserRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(UserRow, 'columns', columns);
AbstractDatabaseRow.overload(UserRow, 'table', TABLE_NAME);

export class NewUserRow extends AbstractNewRow {}
AbstractDatabaseRow.overload(NewUserRow, 'transformFromSnakeCase', serialize.unsnake);
AbstractDatabaseRow.overload(NewUserRow, 'transformToSnakeCase', serialize.snake);
AbstractDatabaseRow.overload(NewUserRow, 'columns', columns);
AbstractDatabaseRow.overload(NewUserRow, 'properties', properties);
AbstractDatabaseRow.overload(NewUserRow, 'table', TABLE_NAME);

export const response = UserRow;
export const create = NewUserRow;
