// @ts-check
import {semester} from '@gradebook/time';
import {knex} from '../../database/index.js';
import {settings} from '../settings/index.js';
import permissionWrap from './wrap.js';

const semesterService = semester.data;

export default permissionWrap(async ({user, semester}, db = null) => {
	if (!semesterService.serverAllowedSemesters.includes(semester)) {
		return {
			___code: 412,
			error: 'Cannot create a course in an archived semester',
		};
	}

	// eslint-disable-next-line camelcase
	const queryResponse = await knex({table: 'courses', db}).count('id AS count').where({user_id: user, semester});

	const numberOfCourses = queryResponse[0].count;

	// CASE: more courses than allowed in one semester
	if (numberOfCourses >= settings.get('max_courses_per_semester')) {
		return 403;
	}

	return true;
});
