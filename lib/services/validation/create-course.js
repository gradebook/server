// @ts-check
import * as errors from '../../errors/index.js';
import {validateSchemeOrDie} from './schema-validator.js';
import {context, validateCutoffs, validateCategoryLimits} from './shared/create-course.js';

/**
 * @typedef {object} CreateCourseRequest
 * @property {{
 *  type: 'partial' | 'guided' | 'import'
 * }} query
 *
 * @property {object} body
 * @property {object} [permissions]
 * @property {object} user
 */

/**
 * @param {CreateCourseRequest} request
 */
export default function checkForRequiredKeys(request, _) {
	validateSchemeOrDie('course.create', request.body);

	if (request.query.type === 'partial') {
		// CASE: The course is declared to be partial and must have an empty cutoffs object.
		if (request.body.course.cutoffs !== '{}') {
			throw new errors.ValidationError({
				context,
				message: 'partial courses must have empty cutoffs object',
			});
		}
	} else if (
		request.query.type === 'guided'
		|| request.query.type === 'import'
		|| request.query.type === 'shared'
		|| request.query.type === undefined
	) {
		validateCutoffs(request.body.course.cutoffs);
	} else {
		// CASE: An invalid query.type was presented.
		throw new errors.ValidationError({
			context,
			message: 'query.type must be `guided`, `partial`, or undefined',
		});
	}

	validateCategoryLimits(request.body.categories);

	request.permissions = {
		user: request.user.id,
		semester: request.body.course.semester,
	};
}
