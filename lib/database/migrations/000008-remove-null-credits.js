// @ts-check
import logger from '../../logging.js';

/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
	const [{count}] = await knex('courses')
		.count('id as count')
		.whereNull('credit_hours');

	const message = 'Converting NULL credit hours to 0';
	if (count === 0) {
		logger.warn(message);
		return;
	}

	logger.info(`${message} for ${count} courses`);
	await knex('courses')
		.whereNull('credit_hours')
		.update('credit_hours', 0);
}

/**
 * @param {import('knex').Knex} _
 */
export async function down(_) {
	// The up migration is destructive because it removes the distinction between NULL (not set by user)
	// and 0 (user says the course is not worth any credits).
	// Credit hours were nullable when they were first introduced because all of the courses in the previous semesters
	// wouldn't have that data. Now that credit hours are mandatory, and we have several semesters with them,
	// we're looking to drop the nullable constraint.
	// Credit hours are mostly used for GPA insights, so the impact of older semesters having 0 instead of NULL is
	// minimal, since GPA insights are only available in active semesters.
	logger.warn('Not converting courses with 0 credit hours to NULL');
}
