// @ts-check
import {validateSchemeOrDie} from './schema-validator.js';

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} _
 */
export function validateUserGpa(request, _) {
	validateSchemeOrDie('user.settings.$$gpa', request.body);
}
