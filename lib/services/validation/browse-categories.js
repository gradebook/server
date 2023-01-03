// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';
import {isSemester} from '../../utils/semester-key-valid.js';

const messages = {
	invalidCourse: course => `Failed loading categories: "${course}" is not a valid course`,
	invalidSemester: semester => `Failed loading categories: "${semester}" is not a valid semester`,
	tooManyFilters: 'Failed loading categories: cannot filter by both a course and semester',
	invalidIncludeGrades: value => `Failed loading categories: "${value}" for includeGrades could not be understood`,
	tooManyQueryParams: 'Failed loading categories: unknown query parameters sent',
};

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} _
 */
export default function validateOptionalFilterParameters(request, _) {
	const query = {...request.query};
	const hasCourse = Object.hasOwnProperty.call(query, 'course');
	const hasSemester = Object.hasOwnProperty.call(query, 'semester');
	const hasIncludeGrades = Object.hasOwnProperty.call(query, 'includeGrades');

	if (hasCourse) {
		if (!isObjectIDValid(query.course)) {
			throw new errors.ValidationError({message: messages.invalidCourse(query.course)});
		}

		if (hasSemester) {
			throw new errors.ValidationError({message: messages.tooManyFilters});
		}

		delete query.course;
	}

	if (hasSemester) {
		if (!isSemester(query.semester)) {
			throw new errors.ValidationError({message: messages.invalidSemester(query.semester)});
		}

		delete query.semester;
	}

	if (hasIncludeGrades) {
		const {includeGrades} = query;

		if (!(includeGrades === 'true' || includeGrades === 'false')) {
			throw new errors.ValidationError({message: messages.invalidIncludeGrades(includeGrades)});
		}

		delete query.includeGrades;
	}

	const remainingKeys = Object.keys(query);

	if (remainingKeys.length > 0) {
		throw new errors.BadRequestError({
			message: messages.tooManyQueryParams,
			context: `Invalid parameters: ${remainingKeys}`,
		});
	}
}
