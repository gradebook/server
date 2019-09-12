const {categories} = require('../../database/schema');
const isObjectID = require('../../utils/object-id-valid');
const createSanitizer = require('../../utils/sanitize-object');
const errors = require('../../errors');

const ALLOWED_KEYS = Object.keys(categories).filter(column => !column.match(/id$/i));

const sanitize = createSanitizer(categories, ALLOWED_KEYS);

module.exports = function checkForRequiredCategoryKeys(req, _, next) {
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
