const ajv = require('./schema-validator');

module.exports = function checkForRequiredCourseKeys(req, _) {
	ajv.validateSchemeOrDie('course.create', req.body);
	ajv.validateSchemeOrDie('course.cutoffs', JSON.parse(req.body.cutoffs));

	req.permissions = {
		user: req.user.id,
		semester: req.body.semester
	};
};
