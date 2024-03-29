// @ts-check

import {getDatabaseType} from '../migration-utils/database-type.js';

/** @param {string} value */
const makeQuery = value =>
	`UPDATE users SET settings = JSON_REPLACE(settings, "$.tour", ${value}) WHERE JSON_EXTRACT(settings, "$.tour");`;

/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
	return knex.raw(makeQuery(Number(31).toString()));
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
	const isMysql = getDatabaseType(knex) === 'mysql';
	return knex.raw(makeQuery(isMysql ? 'true' : 'json("true")'));
}
