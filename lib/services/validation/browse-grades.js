// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';

const messages = {
	invalidCourse: course => `Failed loading grades: "${course}" is not a valid course`,
	invalidCategory: category => `Failed loading grades: "${category}" is not a valid category`,
	tooManyFilters: 'Failed loading grades: cannot filter by both a course and category',
};

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
			throw new errors.ValidationError({message: messages.invalidCourse(query.course)});
		}

		if (hasCategory) {
			throw new errors.ValidationError({message: messages.tooManyFilters});
		}

		delete query.course;
	}

	if (hasCategory) {
		if (!isObjectIDValid(query.category)) {
			throw new errors.ValidationError({message: messages.invalidCategory(query.category)});
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
