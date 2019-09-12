const {courses} = require('../../database/schema');
const errors = require('../../errors');
const createSanitizer = require('../../utils/sanitize-object');
const isSemester = require('../../utils/semester-key-valid');

const ALLOWED_KEYS = Object.keys(courses).filter(column => !column.match(/id$/i));

const sanitize = createSanitizer(courses, ALLOWED_KEYS);

module.exports = function checkForRequiredCourseKeys(req, _, next) {
	req.body = sanitize(req.body);

	if (!isSemester(req.body.semester)) {
		throw new errors.ValidationError({context: 'Invalid semester'});
	}

	req.permissions = {
		user: req.user.id,
		semester: req.body.semester
	};
	next();
};
