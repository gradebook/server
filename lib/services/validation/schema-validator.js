// @ts-check
const AJV = require('ajv').default;
const errors = require('../../errors');
const {loadSchema} = require('./schema-loader');

const validator = new AJV({strict: 'log'});

let initializationMutex = false;

module.exports = validator;
module.exports.init = async () => {
	if (initializationMutex) {
		return;
	}

	const SCHEMAS = [
		loadSchema('./schemas/partial-course-meta.json', require, 'partialCourseMeta'),
		loadSchema('./schemas/partial-batch-create-category.json', require, 'partialCatBatch'),
		loadSchema('./schemas/object-id.json', require),
		loadSchema('./schemas/create-course.json', require),
		loadSchema('./schemas/complete-course-create.json', require),
		loadSchema('./schemas/create-category.json', require, 'createCategory'),
		loadSchema('./schemas/create-grade.json', require, 'createGrade'),
		loadSchema('./schemas/edit-course.json', require, 'editCourse'),
		loadSchema('./schemas/edit-category.json', require, 'editCategory'),
		loadSchema('./schemas/edit-grade.json', require, 'editGrade'),
		loadSchema('./schemas/batch-edit.json', require, 'batchEdit'),
		loadSchema('./schemas/course-cutoffs.json', require),
	];

	validator.addSchema(await Promise.all(SCHEMAS));
	initializationMutex = true;
};

module.exports.validateSchemeOrDie = (name, request) => {
	if (!validator.validate(name, request)) {
		const message = validator.errorsText(validator.errors);
		throw new errors.ValidationError({message, context: 'Failed validating payload'});
	}
};
