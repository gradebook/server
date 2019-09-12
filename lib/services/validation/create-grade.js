const {grades} = require('../../database/schema');
const isObjectID = require('../../utils/object-id-valid');
const createSanitizer = require('../../utils/sanitize-object');
const errors = require('../../errors');

const ALLOWED_KEYS = Object.keys(grades).filter(column => !column.match(/id$/i));
ALLOWED_KEYS.push('course_id', 'category_id');

const sanitize = createSanitizer(grades, ALLOWED_KEYS);

module.exports = function checkForRequiredGradeKeys(req, _, next) {
	req.body = sanitize(req.body);

	if (!isObjectID(req.body.course_id)) {
		throw new errors.ValidationError({context: 'Invalid property: course_id'});
	}

	if (!isObjectID(req.body.category_id)) {
		throw new errors.ValidationError({context: 'Invalid property: category_id'});
	}

	req.permissions = {
		user: req.user.id,
		course: req.body.course_id,
		category: req.body.category_id
	};

	next();
};
