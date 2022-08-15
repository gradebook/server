// @ts-check
import {knex} from '../../database/index.js';
import {grade} from '../../models/index.js';
import permissionWrap from './wrap.js';

const Model = grade.GradeRow;

export default permissionWrap(async ({user, objectId: id}, db = null) => {
	const grade = await knex({table: 'grades', db}).select(['grades.*'])
		.innerJoin('courses', 'grades.course_id', 'courses.id')
		.where('grades.id', id)
		.first();

	// CASE: grade doesn't exist
	if (!grade) {
		return 404;
	}

	// CASE: user does not own grade
	if (grade.user_id !== user) {
		return 404;
	}

	return {status: true, data: new Model(grade)};
});
