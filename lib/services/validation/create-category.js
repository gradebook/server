// @ts-check
const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const settings = require('../../services/settings');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCategoryKeys(request, _) {
	// @ts-ignore
	ajv.validateSchemeOrDie('category.create', request.body);

	if (request.body.grades.length > settings.get('max_grades_per_category')) {
		throw new errors.ValidationError({message: 'Too many grades'});
	}

	if (request.body.grades.length === 1 && request.body.grades[0].name !== null) {
		throw new errors.ValidationError({message: 'Single categories cannot have a grade name'});
	}

	if (!isObjectID(request.body.course)) {
		throw new errors.ValidationError({context: 'Invalid property: course'});
	}

	request.permissions = {
		user: request.user.id,
		course: request.body.course,
	};
};
