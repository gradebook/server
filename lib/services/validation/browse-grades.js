const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');

const PARAMS_TO_CHECK = ['course', 'category'];

module.exports = function validateOptionalFilterParams(req, _) {
	for (const param of PARAMS_TO_CHECK) {
		if (param in req.query && !isObjectID(req.query[param])) {
			throw new errors.ValidationError({context: `Invalid property value: ${param}`});
		}
	}
};
