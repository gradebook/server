const isObjectID = require('../../utils/object-id-valid');
const ajv = require('./schema-validator');
const errors = require('../../errors');

module.exports = function checkForRequiredGradeKeys(req, _, next) {
	ajv.validateSchemeOrDie('grade.edit', req.body);

	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};

	next();
};
