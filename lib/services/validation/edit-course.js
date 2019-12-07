const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');
const constraints = require('./constraints');

const CONSTRAINTS = [
	constraints.list.courseName
];

module.exports = function checkForRequiredCourseKeys(req, _, next) {
	ajv.validateSchemeOrDie('course.edit', req.body);

	if (!isObjectID(req.params.id)) {
		throw new errors.NotFoundError();
	}

	constraints.validateList(CONSTRAINTS, req.body);

	req.permissions = {
		user: req.user.id,
		objectId: req.params.id
	};

	next();
};
