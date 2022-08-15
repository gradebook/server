// @ts-check
import {knex} from '../../database/index.js';
import {course} from '../../models/index.js';
import permissionWrap from './wrap.js';

const Model = course.CourseRow;

export default permissionWrap(async ({user, objectId: id}, db = null) => {
	const course = await knex({db, table: 'courses'}).select('*').where({id}).first();

	// CASE: course does not exist
	if (!course) {
		return 404;
	}

	// CASE: user is not course owner
	if (course.user_id !== user) {
		return 404;
	}

	return {status: true, data: new Model(course)};
});
