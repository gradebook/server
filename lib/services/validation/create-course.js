const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCourseKeys(req, _) {
	ajv.validateSchemeOrDie('course.create', req.body);

	// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
	let parsedCutoffs = {};
	try {
		parsedCutoffs = JSON.parse(req.body.cutoffs);
	} catch {
		throw new errors.ValidationError({context: 'cutoffs are not valid JSON'});
	}

	// Validate cutoffs separately from the rest of the course since they had to be parsed first
	ajv.validateSchemeOrDie('course.cutoffs', parsedCutoffs);

	req.permissions = {
		user: req.user.id,
		semester: req.body.semester
	};
};
