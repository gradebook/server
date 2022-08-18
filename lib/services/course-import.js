// @ts-check
import {semester} from '@gradebook/time';
import * as api from '../api/index.js';
import logging from '../logging.js';
import validateCourseTemplate from '../services/validation/create-course.js';
import * as shrink from './shrink.js';

const semesterService = semester.data;

/** @param {string} data */
const PASS_THROUGH_PREPROCESSOR = data => data;

/**
 *
 * @typedef {(
 * 	databaseOptions: Parameters<import('../database/knex.js')['getKnex']>[0],
 * 	user: string,
 * 	courseIdentifier: string
 * ) => Promise<object | null>} CourseImporter
 *
 */

/**
 * @param {string | undefined} hash
 * @param {(raw: string) => string} [preprocessor]
 */
export async function _convertSerializedCourseToApiCourse(hash, preprocessor) {
	if (!hash) {
		return null;
	}

	const {deserialize, prepareCourseForAPI} = await import('@gradebook/course-serializer');
	try {
		const course = prepareCourseForAPI(deserialize(hash, preprocessor), semesterService.primarySemester);
		/** @type {import('../services/validation/create-course').CreateCourseRequest} */
		const request = {body: course, user: {}, query: {type: 'import'}};
		validateCourseTemplate(request);
		return course;
	} catch (error) {
		logging.error(`Course validation failed for ${preprocessor ? 'slug' : 'hash'}-based import`);
		logging.error(error);
		return null;
	}
}

/** @param {string} courseHash */
export async function importFromHash(courseHash) {
	return _convertSerializedCourseToApiCourse(courseHash);
}

/** @param {string} slug */
export async function importFromSlug(slug) {
	const course = await shrink.safelyRead(slug);

	if (!course) {
		return null;
	}

	return _convertSerializedCourseToApiCourse(course, PASS_THROUGH_PREPROCESSOR);
}
}
