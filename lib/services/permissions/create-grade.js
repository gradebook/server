// @ts-check
import createDebugger from 'ghost-ignition/lib/debug.js';
import {knex} from '../../database/index.js';
import {settings} from '../../services/settings/index.js';
import permissionWrap from './wrap.js';

const debug = createDebugger('permissions:create-grade');

export default permissionWrap(async ({user, course, category}, db = null) => {
	const queryResponse = await knex({table: 'grades', db})
		.select(['grades.user_id', 'grades.course_id'])
		.count('grades.id as count')
		.innerJoin('courses', /** @type {import('knex').Knex.JoinCallback} */ function limitCourseId() {
			this.on('courses.id', '=', knex.instance.raw('?', [course]));
		})
		// eslint-disable-next-line camelcase
		.where({category_id: category})
		// Filter for grades (and not categories)
		// Remember: to create a single grade, the request needs to be sent to the
		// put /categories endpoint
		// @todo: Query this and return Precondition Failed
		.whereNotNull('grades.name');

	const {count: numberOfGrades, user_id: owner} = queryResponse[0];

	// CASE: someone tries to create a grade for you
	// CASE: the category does not exist (user will be undefined)
	if (owner !== user) {
		debug('owner !== user', owner, user);
		return 404;
	}

	// CASE: exceeded grade limit
	if (numberOfGrades >= settings.get('max_grades_per_category')) {
		debug('too many grades', numberOfGrades);
		return 403;
	}

	return true;
});
