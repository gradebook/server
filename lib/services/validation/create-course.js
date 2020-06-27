const ajv = require('./schema-validator');

module.exports = function checkForRequiredCourseKeys(req, _) {
	ajv.validateSchemeOrDie('course.create', req.body);

	// @todo: Remove if condition after cutoff migrations
	if (req.body.cutoffs) {
		ajv.validateSchemeOrDie('course.cutoffs')
	}

	req.permissions = {
		user: req.user.id,
		semester: req.body.semester
	};
};
