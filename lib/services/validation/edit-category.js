const {categories} = require('../../database/schema');
const isObjectID = require('../../utils/object-id-valid');
const createSanitizer = require('../../utils/sanitize-object');
const errors = require('../../errors');
const constraints = require('./constraints');

const ALLOWED_KEYS = Object.keys(categories).filter(column => !column.match(/id$/i));

const sanitize = createSanitizer(categories, ALLOWED_KEYS);
const CONSTRAINTS = [
	constraints.list.weight
];

module.exports = function checkForRequiredCategoryKeys(req, _, next) {
	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	const enforceRequiredProperties = req.method === 'PUT';
	req.body = sanitize(req.body, enforceRequiredProperties);

	constraints.validateList(CONSTRAINTS, req.body);

	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};

	next();
};
