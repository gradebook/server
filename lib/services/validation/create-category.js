// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';
import {settings} from '../../services/settings/index.js';
import {validateSchemeOrDie} from './schema-validator.js';

const messages = {
	invalidCourse: course => `Failed creating category: "${course}" is not a valid course`,
	tooManyGrades: 'Failed creating category: grade count exceeded the limit',
	assignmentGradeShouldNotHaveAName: 'Failed creating assignment: the grade cannot contain a name',
};

export default function checkForRequiredCategoryKeys(request, _) {
	validateSchemeOrDie('category.create', request.body);

	if (request.body.grades.length > settings.get('max_grades_per_category')) {
		throw new errors.ValidationError({message: messages.tooManyGrades});
	}

	if (request.body.grades.length === 1 && request.body.grades[0].name !== null) {
		throw new errors.ValidationError({message: messages.assignmentGradeShouldNotHaveAName});
	}

	if (!isObjectIDValid(request.body.course)) {
		throw new errors.ValidationError({context: messages.invalidCourse(request.body.course)});
	}

	request.permissions = {
		user: request.user.id,
		course: request.body.course,
	};
}
