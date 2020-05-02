const ajv = require('./schema-validator');

module.exports = function checkForRequiredGradeKeys(req, _) {
	ajv.validateSchemeOrDie('grade.create', req.body);

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
};
