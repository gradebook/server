const AJV = require('ajv');
const errors = require('../../errors');

const SCHEMAS = [
	require('./schemas/object-id.json'),
	require('./schemas/course-cut.json'),
	require('./schemas/course-cut-name.json'),
	require('./schemas/create-course.json'),
	require('./schemas/import-course.json'),
	require('./schemas/create-category.json'),
	require('./schemas/create-grade.json'),
	require('./schemas/edit-course.json'),
	require('./schemas/edit-category.json'),
	require('./schemas/edit-grade.json'),
	require('./schemas/contract-category.json'),
	require('./schemas/batch-edit.json'),
	require('./schemas/course-cutoffs.json')
];

const validator = new AJV();

validator.addSchema(SCHEMAS);

module.exports = validator;
module.exports.validateSchemeOrDie = (name, request) => {
	if (!validator.validate(name, request)) {
		const message = validator.errorsText(validator.errors);
		throw new errors.ValidationError({message, context: 'Failed validating payload'});
	}
};
