const {grades} = require('../../database/schema');
const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredGradeKeys(req, _, next) {
	if (!ajv.validate('grade.create', req.body)) {
		const message = ajv.errorsText(ajv.errors);
		throw new errors.ValidationError({message, context: 'Failed validating payload'});
	}

	if (!isObjectID(req.body.course)) {
		throw new errors.ValidationError({context: 'Invalid property: course'});
	}

	if (!isObjectID(req.body.category)) {
		throw new errors.ValidationError({context: 'Invalid property: category'});
	}

	req.body.course_id = req.body.course;
	req.body.category_id = req.body.category;
	delete req.body.category;
	delete req.body.course;

	req.permissions = {
		user: req.user.id,
		course: req.body.course_id,
		category: req.body.category_id
	};

	next();
};
