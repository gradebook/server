const errors = require('../../errors');
const isSemester = require('../../utils/semester-key-valid');
const ajv = require('./schema-validator');
const constraints = require('./constraints');

const CONSTRAINTS = [
	constraints.list.courseName
];

module.exports = function checkForRequiredCourseKeys(req, _, next) {
	if (!ajv.validate('course.create', req.body)) {
		const message = ajv.errorsText(ajv.errors);
		throw new errors.ValidationError({message, context: 'Failed validating payload'});
	}

	if (!isSemester(req.body.semester)) {
		throw new errors.ValidationError({context: 'Invalid semester'});
	}

	constraints.validateList(CONSTRAINTS, req.body);

	req.permissions = {
		user: req.user.id,
		semester: req.body.semester
	};

	next();
};
