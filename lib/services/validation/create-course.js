const ajv = require('./schema-validator');

module.exports = function checkForRequiredCourseKeys(req, _) {
	ajv.validateSchemeOrDie('course.create', req.body);

	req.permissions = {
		user: req.user.id,
		semester: req.body.semester
	};
};
