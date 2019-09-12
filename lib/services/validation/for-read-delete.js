const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');

module.exports = function validateForReadAndDelete(req, _, next) {
	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};

	next();
};
