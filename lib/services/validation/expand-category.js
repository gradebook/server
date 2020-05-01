const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');

module.exports = function expectEmptyBody(req, _) {
	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	if (Object.keys(req.body).length !== 0) {
		throw new errors.ValidationError({message: 'data should NOT have any properties', context: 'Expand Category'});
	}

	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};
};
