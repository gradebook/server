// @ts-check
import {isSemester} from '../../utils/semester-key-valid.js';
import * as errors from '../../errors/index.js';

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} _
 */
export default function validateOptionalFilterParameters(request, _) {
	const query = {...request.query};
	const hasSemester = Object.hasOwnProperty.call(query, 'semester');

	// @NOTE: Semester must be uppercase; we won't make it uppercase for you
	if (hasSemester) {
		if (!isSemester(request.query.semester)) {
			throw new errors.ValidationError({message: 'Invalid semester'});
		}

		delete query.semester;
	}

	const remainingKeys = Object.keys(query);

	if (remainingKeys.length > 0) {
		throw new errors.BadRequestError({
			message: 'Unknown query parameters sent',
			context: `Invalid parameters: ${remainingKeys}`,
		});
	}
}
