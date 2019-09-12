const {grades} = require('../../database/schema');
const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const createSanitizer = require('../../utils/sanitize-object');

const ALLOWED_KEYS = Object.keys(grades).filter(column => !column.match(/id$/i));

const sanitize = createSanitizer(grades, ALLOWED_KEYS);

module.exports = function checkForRequiredGradeKeys(req, _, next) {
	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	const enforceRequiredProperties = req.method === 'PUT';
	req.body = sanitize(req.body, enforceRequiredProperties);
	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};

	next();
};
