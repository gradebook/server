const ajv = require('./schema-validator');

module.exports = function checkForRequiredGradeKeys(request, _) {
	ajv.validateSchemeOrDie('grade.create', request.body);

	request.permissions = {
		user: request.user.id,
		course: request.body.course,
		category: request.body.category,
	};
};
