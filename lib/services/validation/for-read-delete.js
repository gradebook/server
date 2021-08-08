const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');

module.exports = function validateForReadAndDelete(request, _) {
	if (!isObjectID(request.params.id)) {
		throw new errors.NotFoundError();
	}

	request.permissions = {
		user: request.user.id,
		objectId: request.params.id,
	};
};
