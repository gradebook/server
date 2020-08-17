// @ts-check
const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const isSemester = require('../../utils/semester-key-valid');

/**
 * @param {import('../../../global.d').Request} request
 * @param {import('../../../global.d').Response} _
 */
module.exports = function validateOptionalFilterParams(request, _) {
	const query = {...request.query};
	const hasCourse = Object.hasOwnProperty.call(query, 'course');
	const hasSemester = Object.hasOwnProperty.call(query, 'semester');
	const hasIncludeGrades = Object.hasOwnProperty.call(query, 'includeGrades');

	if (hasCourse) {
		if (!isObjectID(query.course)) {
			throw new errors.ValidationError({message: 'Invalid course'});
		}

		if (hasSemester) {
			throw new errors.ValidationError({message: 'Cannot filter by both a course and semester'});
		}

		delete query.course;
	}

	if (hasSemester) {
		if (!isSemester(query.semester)) {
			throw new errors.ValidationError({message: 'Invalid semester'});
		}

		delete query.semester;
	}

	if (hasIncludeGrades) {
		const {includeGrades} = query;

		if (!(includeGrades === 'true' || includeGrades === 'false')) {
			throw new errors.ValidationError({message: 'includeGrades is not a valid boolean'});
		}

		delete query.includeGrades;
	}

	const remainingKeys = Object.keys(query);

	if (remainingKeys.length > 0) {
		throw new errors.BadRequestError({
			message: 'Unknown query parameters sent',
			context: `Invalid parameters: ${remainingKeys}`
		});
	}
};
