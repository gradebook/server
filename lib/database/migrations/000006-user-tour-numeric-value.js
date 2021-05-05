// @ts-check

/** @param {string} value */
const makeQuery = value =>
	`UPDATE users SET settings = JSON_REPLACE(settings, "$.tour", ${value}) WHERE JSON_EXTRACT(settings, "$.tour");`;

/**
 * @param {import('knex').Knex} knex
 */
async function up(knex) {
	// @TODO: get the proper number
	return knex.raw(makeQuery(Number(100000).toString()));
}

/**
 * @param {import('knex').Knex} knex
 */
async function down(knex) {
	const isMysql = knex.client.config.client !== 'sqlite3';
	return knex.raw(makeQuery(isMysql ? 'true' : 'json("true")'));
}

module.exports = {up, down};
