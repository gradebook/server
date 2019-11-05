const {courses} = require('../../database/schema');
const isObjectID = require('../../utils/object-id-valid');
const createSanitizer = require('../../utils/sanitize-object');
const errors = require('../../errors');
const constraints = require('./constraints');

const ALLOWED_KEYS = Object.keys(courses).filter(column => !column.match(/id$/i));

const sanitize = createSanitizer(courses, ALLOWED_KEYS);
const CONSTRAINTS = [
	constraints.list.courseName,
	constraints.list.cut('a'),
	constraints.list.cut('b'),
	constraints.list.cut('c'),
	constraints.list.cut('d')
];

module.exports = function checkForRequiredCourseKeys(req, _, next) {
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
