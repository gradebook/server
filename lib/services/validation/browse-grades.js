// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} _
 */
export default function validateOptionalFilterParameters(request, _) {
	const query = {...request.query};
	const hasCourse = Object.hasOwnProperty.call(query, 'course');
	const hasCategory = Object.hasOwnProperty.call(query, 'category');

	if (hasCourse) {
		if (!isObjectIDValid(query.course)) {
			throw new errors.ValidationError({message: 'Invalid course'});
		}

		if (hasCategory) {
			throw new errors.ValidationError({message: 'Cannot filter by both a course and category'});
		}

		delete query.course;
	}

	if (hasCategory) {
		if (!isObjectIDValid(query.category)) {
			throw new errors.ValidationError({message: 'Invalid category'});
		}

		delete query.category;
	}

	const remainingKeys = Object.keys(query);

	if (remainingKeys.length > 0) {
		throw new errors.BadRequestError({
			message: 'Unknown query parameters sent',
			context: `Invalid parameters: ${remainingKeys}`,
		});
	}
}
