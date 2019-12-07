const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCategoryKeys(req, _, next) {
	if (!ajv.validate('category.create', req.body)) {
		const message = ajv.errorsText(ajv.errors);
		throw new errors.ValidationError({message, context: 'Failed validating payload'});
	}

	if (!isObjectID(req.body.course)) {
		throw new errors.ValidationError({context: 'Invalid property: course'});
	}

	// @todo: add function that transforms {course, category} to {course, category}_id
	// We're eventually trying to get rid of the _id properties except for the db layer
	req.body.course_id = req.body.course;
	delete req.body.course;

	req.permissions = {
		user: req.user.id,
		course: req.body.course_id
	};

	next();
};
