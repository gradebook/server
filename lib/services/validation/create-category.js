// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';
import {settings} from '../../services/settings/index.js';
import {validateSchemeOrDie} from './schema-validator.js';

export default function checkForRequiredCategoryKeys(request, _) {
	validateSchemeOrDie('category.create', request.body);

	if (request.body.grades.length > settings.get('max_grades_per_category')) {
		throw new errors.ValidationError({message: 'Too many grades'});
	}

	if (request.body.grades.length === 1 && request.body.grades[0].name !== null) {
		throw new errors.ValidationError({message: 'Single categories cannot have a grade name'});
	}

	if (!isObjectIDValid(request.body.course)) {
		throw new errors.ValidationError({context: 'Invalid property: course'});
	}

	request.permissions = {
		user: request.user.id,
		course: request.body.course,
	};
}
