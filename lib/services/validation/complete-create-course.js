// @ts-check
import {validateSchemeOrDie} from './schema-validator.js';
import {validateCategoryLimits} from './shared/create-course.js';

export default function checkForRequiredKeys(request, _) {
	validateSchemeOrDie('course.create.complete', request.body);
	validateCategoryLimits(request.body.categories);

	request.permissions = {
		objectId: request.params.id,
		user: request.user.id,
	};
}
