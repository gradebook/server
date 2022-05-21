// @ts-check
import {createRequire} from 'module';
import AJV from 'ajv';
import * as errors from '../../errors/index.js';
import logging from '../../logging.js';
import {loadSchema} from './schema-loader.js';

const require = createRequire(import.meta.url);

/**
 * @param {unknown} message
 */
function isFalsePositive(message) {
	return typeof message === 'string' && (
		message.includes('grades.batch#/dependencies/delete/not')
		|| message.includes('grades.batch#/dependencies/create/not')
		|| message.includes('grade.edit#/anyOf/0')
		|| message.includes('grade.edit#/anyOf/1')
	);
}

const createLogger = level => (...args) => !isFalsePositive(args[0]) && logging[level](...args);

const validator = new AJV({
	strict: 'log',
	logger: {
		warn: createLogger('warn'),
		log: createLogger('log'),
		error: createLogger('error'),
	},
});

let initializationMutex = false;

export default validator;
export async function init() {
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
		loadSchema('./schemas/user-issue-reporter.json', require),
	];

	validator.addSchema(await Promise.all(SCHEMAS));
	initializationMutex = true;
}

export function validateSchemeOrDie(name, request) {
	if (!validator.validate(name, request)) {
		const message = validator.errorsText(validator.errors);
		throw new errors.ValidationError({message, context: 'Failed validating payload'});
	}
}
