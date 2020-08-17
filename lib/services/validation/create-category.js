// @ts-check
const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const settings = require('../../services/settings');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCategoryKeys(req, _) {
	// @ts-ignore
	ajv.validateSchemeOrDie('category.create', req.body);

	if (req.body.grades.length > settings.get('max_grades_per_category', 10)) {
		throw new errors.ValidationError({message: 'Too many grades'});
	}

	if (req.body.grades.length === 1 && req.body.grades[0].name !== null) {
		throw new errors.ValidationError({message: 'Single categories cannot have a grade name'});
	}

	if (!isObjectID(req.body.course)) {
		throw new errors.ValidationError({context: 'Invalid property: course'});
	}

	req.permissions = {
		user: req.user.id,
		course: req.body.course
	};
};
