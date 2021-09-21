// @ts-check
const ajv = require('./schema-validator');
const courseCreateHelpers = require('./shared/create-course');

module.exports = function checkForRequiredKeys(request, _) {
	// @ts-expect-error
	ajv.validateSchemeOrDie('course.create.complete', request.body);
	courseCreateHelpers.validateCategoryLimits(request.body.categories);

	request.permissions = {
		objectId: request.params.id,
		user: request.user.id,
	};
};
