import {getDatabaseType} from '../migration-utils/database-type.js';

/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
	const JSON_PATCH = getDatabaseType(knex) === 'sqlite3' ? 'JSON_PATCH' : 'JSON_MERGE_PATCH';
	const IF = getDatabaseType(knex) === 'sqlite3' ? 'IIF' : 'IF';
	/**
	 * Adds a "gpa" object to the user's settings object.
	 * Before: {
	 *   "gpaSemester": "2025F",
	 *   "overallGpa": "3.2",
	 *   "overallCredits": 12
	 * }
	 * After: {
	 *   "gpaSemester": "2025F",
	 *   "overallGpa": "3.2",
	 *   "overallCredits": 12
	 *   // NEW PROPERTY
	 *   "gpa": {
	 *      "2025F": [3.2, 12]
	 *   }
	 * }
	 */
	await knex.raw(`
UPDATE users SET settings = ${JSON_PATCH}(settings, JSON_OBJECT(
	"gpa",
	${IF}(
		JSON_EXTRACT(settings, '$.gpaSemester'),
		JSON_OBJECT(
			${'' /* settings.gpa[settings.gpaSemester] = [settings.overallGpa, settings.overallCredits] */}
			JSON_EXTRACT(settings, "$.gpaSemester"),
			JSON_ARRAY(
				CAST(JSON_EXTRACT(settings, "$.overallGpa") AS FLOAT),
				CAST(JSON_EXTRACT(settings, "$.overallCredits") AS FLOAT)
			)
		),
		JSON_OBJECT()
	)
))
`);
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
	await knex.raw('UPDATE users SET settings = JSON_REMOVE(settings, "$.gpa")');
}
