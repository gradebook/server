const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredGradeKeys(req, _, next) {
	ajv.validateSchemeOrDie('grade.create', req.body);

	if (!isObjectID(req.body.course)) {
		throw new errors.ValidationError({context: 'Invalid property: course'});
	}

	if (!isObjectID(req.body.category)) {
		throw new errors.ValidationError({context: 'Invalid property: category'});
	}

	// eslint-disable-next-line camelcase
	req.body.course_id = req.body.course;
	// eslint-disable-next-line camelcase
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
