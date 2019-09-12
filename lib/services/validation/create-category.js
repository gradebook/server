const {categories} = require('../../database/schema');
const isObjectID = require('../../utils/object-id-valid');
const createSanitizer = require('../../utils/sanitize-object');
const errors = require('../../errors');

const ALLOWED_KEYS = Object.keys(categories).filter(column => !column.match(/id$/i));
ALLOWED_KEYS.push('course_id');

const sanitize = createSanitizer(categories, ALLOWED_KEYS);

module.exports = function checkForRequiredCategoryKeys(req, _, next) {
	req.body = sanitize(req.body);

	if (!isObjectID(req.body.course_id)) {
		throw new errors.ValidationError({context: 'Invalid property: course_id'});
	}

	req.permissions = {
		user: req.user.id,
		course: req.body.course_id
	};

	next();
};
