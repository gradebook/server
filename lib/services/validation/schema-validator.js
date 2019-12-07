const AJV = require('ajv');
const errors = require('../../errors');

const SCHEMAS = [
	require('./schemas/object-id'),
	require('./schemas/course-cut'),
	require('./schemas/create-course'),
	require('./schemas/create-category'),
	require('./schemas/create-grade'),
	require('./schemas/edit-course'),
	require('./schemas/edit-category'),
	require('./schemas/edit-grade')
];

const validator = new AJV();

validator.addSchema(SCHEMAS);

module.exports = validator;
module.exports.validateSchemeOrDie = (name, request) => {
	if (!validator.validate(name, request)) {
		const message = validator.errorsText(validator.errors);
		throw new errors.ValidationError({message, context: 'Failed validating payload'});
	}
}
