const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCourseKeys(req, _) {
	ajv.validateSchemeOrDie('course.edit', req.body);

	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};
};
