// @ts-check
import {validateSchemeOrDie} from './schema-validator.js';

export default function checkForRequiredGradeKeys(request, _) {
	validateSchemeOrDie('grade.create', request.body);

	request.permissions = {
		user: request.user.id,
		course: request.body.course,
		category: request.body.category,
	};
}
