import {semester} from '@gradebook/time';
import * as api from '../api/index.js';
import logging from '../logging.js';
import validateCourseTemplate from '../services/validation/create-course.js';

const semesterService = semester.data;

export async function _convertHashToCourse(hash) {
	if (!hash) {
		return null;
	}

	const {deserialize, prepareCourseForAPI} = await import('@gradebook/course-serializer');
	try {
		const course = prepareCourseForAPI(deserialize(hash), semesterService.primarySemester);
		/** @type {import('../services/validation/create-course').CreateCourseRequest} */
		const request = {body: course, user: {}, query: {type: 'import'}};
		validateCourseTemplate(request);
		return course;
	} catch (error) {
		logging.error('Course validation failed');
		logging.error(error);
		return null;
	}
}

/**
 * @param {Parameters<import('../database/knex.js')['getKnex']>[0]} databaseOptions
 * @param {string} user
 * @param {string} courseHash
 */
export async function importFromHash(databaseOptions, user, courseHash) {
	const course = await _convertHashToCourse(courseHash);
	courseHash.user = user.id;
	await api.course.create(course, databaseOptions.db, databaseOptions.txn);
}
