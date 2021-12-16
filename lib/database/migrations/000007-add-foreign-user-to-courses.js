// @ts-check
const logger = require('../../logging.js');

/**
 * @param {import('knex').Knex} knex
 */
async function up(knex) {
	const isMysql = knex.client.config.client !== 'sqlite3';

	if (isMysql) {
		const [tableDefinition] = await knex.raw('DESCRIBE courses');
		const hasForeignKey = tableDefinition.some(row => row.Field === 'user_id' && row.Key === 'MUL');
		if (hasForeignKey) {
			logger.warn('Foreign key already exists: courses.user_id');
			return;
		}
	}

	logger.info('Adding foreign key: courses.user_id');

	return knex.schema.alterTable('courses', table => {
		if (!isMysql) {
			table.dropForeign('user_id');
		}

		table.foreign('user_id').references('users.id');
	});
}

/**
 * @param {import('knex').Knex} knex
 */
async function down(knex) {
	return knex.schema.alterTable('courses', table => {
		logger.info('Removing foreign key from courses.user_id');
		table.dropForeign('user_id');
	});
}

module.exports = {up, down};
