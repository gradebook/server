// @ts-check
import {validateSchemeOrDie} from './schema-validator.js';

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} _
 */
export function linkSyllabus(request, _) {
	validateSchemeOrDie('syllabus.link', request.body);
}
