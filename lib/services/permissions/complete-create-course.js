// @ts-check
import {semester} from '@gradebook/time';
import knex from '../../database/knex.js';
import {course} from '../../models/index.js';
import permissionWrap from './wrap.js';

const semesterService = semester.data;
const Model = course.CourseRow;

export default permissionWrap(async ({user, objectId: id}, db = null) => {
	const course = await knex({db, table: 'courses'})
		.select('courses.*')
		.count('categories.id as categories')
		.leftJoin('categories', 'categories.course_id', 'courses.id')
		.where('courses.id', knex.instance.raw('?', id))
		.first();

	// CASE: course does not exist
	if (!course) {
		return 404;
	}

	// CASE: user is not course owner
	if (course.user_id !== user) {
		return 404;
	}

	// CASE: course is in an archived semester
	if (!semesterService.serverAllowedSemesters.includes(course.semester)) {
		return {
			___code: 412,
			error: 'Cannot finish creating a course in an archived semester',
		};
	}

	if (course.categories > 0) {
		return {
			___code: 412,
			error: 'Cannot finish creating a course that already has categories',
		};
	}

	delete course.categories;

	return {status: true, data: new Model(course)};
});
