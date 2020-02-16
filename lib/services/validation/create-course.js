const ajv = require('./schema-validator');

module.exports = function checkForRequiredCourseKeys(req, _, next) {
	ajv.validateSchemeOrDie('course.create', req.body);

	req.permissions = {
		user: req.user.id,
		semester: req.body.semester
	};

	next();
};
