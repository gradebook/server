const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCourseKeys(req, _) {
	ajv.validateSchemeOrDie('course.edit', req.body);

	if (req.body.cutoffs) {
		// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
		let parsedCutoffs = {};
		try {
			parsedCutoffs = JSON.parse(req.body.cutoffs);
		} catch {
			throw new errors.ValidationError({context: 'Invalid property: cutoffs'});
		}

		// Validate cutoffs separately from the rest of the course since they had to be parsed first
		ajv.validateSchemeOrDie('course.cutoffs', parsedCutoffs);
	}

	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};
};
