// @ts-check
const errors = require('../../errors');
const ajv = require('./schema-validator');
const courseCreateHelpers = require('./shared/create-course');

const {context} = courseCreateHelpers;

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
module.exports = function checkForRequiredKeys(request, _) {
	// @ts-expect-error
	ajv.validateSchemeOrDie('course.create', request.body);

	if (request.query.type === 'partial') {
		// CASE: The course is declared to be partial and must have an empty cutoffs object.
		if (request.body.course.cutoffs !== '{}') {
			throw new errors.ValidationError({
				context,
				message: 'partial courses must have empty cutoffs object',
			});
		}
	} else if (request.query.type === 'guided' || request.query.type === 'import' || request.query.type === undefined) {
		courseCreateHelpers.validateCutoffs(request.body.course.cutoffs);
	} else {
		// CASE: An invalid query.type was presented.
		throw new errors.ValidationError({
			context,
			message: 'query.type must be `guided`, `partial`, or undefined',
		});
	}

	courseCreateHelpers.validateCategoryLimits(request.body.categories);

	request.permissions = {
		user: request.user.id,
		semester: request.body.course.semester,
	};
};
