// @ts-check
import {semester} from '@gradebook/time';
import {knex} from '../../database/index.js';
import {course} from '../../models/index.js';
import permissionWrap from './wrap.js';

const semesterService = semester.data;
const Model = course.CourseRow;

export default permissionWrap(async ({user, objectId: id, forUpdate = false}, db = null) => {
	const course = await knex({db, table: 'courses'}).select('*').where({id}).first();

	// CASE: course does not exist
	if (!course) {
		return 404;
	}

	// CASE: user is not course owner
	if (course.user_id !== user) {
		return 404;
	}

	// CASE: category is not in current semester
	if (forUpdate && !semesterService.allowedSemesters.includes(course.semester)) {
		return {
			___code: 412,
			error: 'Cannot edit a course in an archived semester',
		};
	}

	return {status: true, data: new Model(course)};
});
