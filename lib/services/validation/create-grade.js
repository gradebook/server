const ajv = require('./schema-validator');

module.exports = function checkForRequiredGradeKeys(req, _) {
	ajv.validateSchemeOrDie('grade.create', req.body);

	req.permissions = {
		user: req.user.id,
		course: req.body.course,
		category: req.body.category
	};
};
