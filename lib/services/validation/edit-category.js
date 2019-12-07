const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredCategoryKeys(req, _, next) {
	ajv.validateSchemeOrDie('category.edit', req.body);

	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};

	next();
};
