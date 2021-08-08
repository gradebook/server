const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCourseKeys(request, _) {
	ajv.validateSchemeOrDie('course.edit', request.body);

	if (request.body.cutoffs) {
		// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
		let parsedCutoffs = {};
		try {
			parsedCutoffs = JSON.parse(request.body.cutoffs);
		} catch {
			throw new errors.ValidationError({context: 'Invalid property: cutoffs'});
		}

		// Validate cutoffs separately from the rest of the course since they had to be parsed first
		ajv.validateSchemeOrDie('course.cutoffs', parsedCutoffs);
	}

	if (!isObjectID(request.params.id)) {
		throw new errors.NotFoundError();
	}

	request.permissions = {
		user: request.user.id,
		objectId: request.params.id,
		forUpdate: true,
	};
};
