// @ts-check
const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');

/**
 * @param {import('../../../global.d').Request} request
 * @param {import('../../../global.d').Response} _
 */
module.exports = function validateOptionalFilterParams(request, _) {
	const query = {...request.query};
	const hasCourse = Object.hasOwnProperty.call(query, 'course');
	const hasCategory = Object.hasOwnProperty.call(query, 'category');

	if (hasCourse) {
		if (!isObjectID(query.course)) {
			throw new errors.ValidationError({message: 'Invalid course'});
		}

		if (hasCategory) {
			throw new errors.ValidationError({message: 'Cannot filter by both a course and category'});
		}

		delete query.course;
	}

	if (hasCategory) {
		if (!isObjectID(query.category)) {
			throw new errors.ValidationError({message: 'Invalid category'});
		}

		delete query.category;
	}

	const remainingKeys = Object.keys(query);

	if (remainingKeys.length > 0) {
		throw new errors.BadRequestError({
			message: 'Unknown query parameters sent',
			context: `Invalid parameters: ${remainingKeys}`
		});
	}
};
