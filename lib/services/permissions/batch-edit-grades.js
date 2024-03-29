// @ts-check
import createDebugger from 'ghost-ignition/lib/debug.js';
import {knex} from '../../database/index.js';
import {settings} from '../../services/settings/index.js';
import {grade} from '../../models/index.js';
import permissionWrap from './wrap.js';

const debug = createDebugger('permissions:batch-edit-grades');
const Model = grade.GradeRow;

function responseContainsId(id, response) {
	for (const single of response) {
		if (single.id === id) {
			return true;
		}
	}

	return false;
}

export default permissionWrap(async ({user, category, create, delete: del, ids}, db = null) => {
	const maxGrades = settings.get('max_grades_per_category');

	// CASE: trying to edit more grades than exist in category
	if (ids.length > maxGrades) {
		debug('batch-edit:', ids.length, 'grades but', maxGrades, 'allowed');
		return 400;
	}

	const grades = await knex({db, table: 'grades'})
		.select(['grades.*'])
		.innerJoin('courses', 'grades.course_id', 'courses.id')
		.where('category_id', category)
		.andWhere('grades.user_id', user);

	// CASE: category does not exist, or was corrupted
	if (grades.length === 0) {
		return 404;
	}

	const {course_id: course} = grades[0];

	for (const id of ids) {
		if (!responseContainsId(id, grades)) {
			debug('batch-edit:', ids, 'not included in category...', grades);
			return 400;
		}
	}

	// CASE: would create too many ny grades
	if (grades.length + create.length > maxGrades) {
		debug('too many grades', maxGrades);
		return 403;
	}

	const gradeMap = {};

	for (const grade of grades) {
		if (!del.includes(grade.id)) {
			gradeMap[grade.id] = new Model(grade);
		}
	}

	return {status: true, data: {course, gradeMap}};
});
