// @ts-check
import logger from '../../logging.js';
import {getDatabaseType} from '../migration-utils/database-type.js';

/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
	const isMysql = getDatabaseType(knex) === 'mysql';

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
export async function down(knex) {
	return knex.schema.alterTable('courses', table => {
		logger.info('Removing foreign key from courses.user_id');
		table.dropForeign('user_id');
	});
}
