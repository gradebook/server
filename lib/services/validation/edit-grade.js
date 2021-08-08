const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredGradeKeys(request, _) {
	ajv.validateSchemeOrDie('grade.edit', request.body);

	if (!isObjectID(request.params.id)) {
		throw new errors.NotFoundError();
	}

	request.permissions = {
		user: request.user.id,
		objectId: request.params.id,
		forUpdate: true,
	};
};
