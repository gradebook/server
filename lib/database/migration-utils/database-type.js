// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
export function getDatabaseType(knex) {
	return knex.client.config.client === 'sqlite3' ? 'sqlite3' : 'mysql';
}
