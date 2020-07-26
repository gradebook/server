const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCategoryKeys(req, _) {
	ajv.validateSchemeOrDie('category.create', req.body);

	if (!isObjectID(req.body.course)) {
		throw new errors.ValidationError({context: 'Invalid property: course'});
	}

	req.permissions = {
		user: req.user.id,
		course: req.body.course
	};
};
