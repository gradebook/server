// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';
import {validateSchemeOrDie} from './schema-validator.js';

export default function checkForRequiredCourseKeys(request, _) {
	validateSchemeOrDie('course.edit', request.body);

	if (request.body.cutoffs) {
		// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
		let parsedCutoffs = {};
		try {
			parsedCutoffs = JSON.parse(request.body.cutoffs);
		} catch {
			throw new errors.ValidationError({context: 'Invalid property: cutoffs'});
		}

		// Validate cutoffs separately from the rest of the course since they had to be parsed first
		validateSchemeOrDie('course.cutoffs', parsedCutoffs);
	}

	if (!isObjectIDValid(request.params.id)) {
		throw new errors.NotFoundError();
	}

	request.permissions = {
		user: request.user.id,
		objectId: request.params.id,
		forUpdate: true,
	};
}
