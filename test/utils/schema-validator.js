// @ts-check
const {expect} = require('chai');
const AJV = require('ajv').default;
const settingsService = require('../../lib/services/settings/index.js');
const {loadSchema} = require('../../lib/services/validation/schema-loader.js');
const {init: initializeSchemaValidator} = require('../../lib/services/validation/schema-validator.js');
const testConfig = require('./test-config.js');

const schemaCache = {};

/**
 * @param {NodeRequire} yourRequire
 * @param {string} path
 */
function getSchema(yourRequire, path) {
	const absolutePath = yourRequire.resolve(path);
	if (!(absolutePath in schemaCache)) {
		const cleanPath = absolutePath.replace(process.cwd(), '.');
		throw new Error(`Attempted to load non-existant schema ${cleanPath}`);
	}

	return schemaCache[absolutePath];
}

/**
 * @typedef {object} Schema
 * @property {NodeRequire} require
 * @property {string} path
 */

/**
 * @param {string} coreSchemaPath
 * @param {NodeRequire} yourRequire
 * @param {string[]} [additionalSchemas]
 */
module.exports = function createSchemaValidator(coreSchemaPath, yourRequire, additionalSchemas = []) {
	const ajv = new AJV();
	for (const helperSchema of additionalSchemas) {
		ajv.addSchema(getSchema(yourRequire, helperSchema));
	}

	const schema = getSchema(yourRequire, coreSchemaPath);

	return {
		expectValid(payload) {
			expect(ajv.validate(schema, payload)).to.be.ok;
		},

		expectInvalid(payload, kv = [], messageMatch = '', logError = false) {
			if (testConfig.isCI) {
				expect(logError, 'SchemaValidation: logError is a *debug tool* and should not be used in tests').to.not.be.ok;
			}

			expect(ajv.validate(schema, payload)).to.not.be.ok;
			expect(kv.length, 'Error is properly validated').to.equal(2);

			const {errors} = ajv;
			if (logError) {
				// eslint-disable-next-line no-console
				console.log(errors);
			}

			const [key, value] = kv;
			expect(errors[0][key]).to.equal(value);
			expect(errors[0].message).to.contain(messageMatch);
		},
	};
};

module.exports.preFetch = async function () {
	/**
	 * @type {Array<[string, Parameters<typeof loadSchema>[2]] | [string]>}
	 */
	const schemas = [
		['../../lib/services/validation/schemas/batch-edit.json', 'batchEdit'],
		['../../lib/services/validation/schemas/complete-course-create.json'],
		['../../lib/services/validation/schemas/course-cutoffs.json'],
		['../../lib/services/validation/schemas/create-category.json', 'createCategory'],
		['../../lib/services/validation/schemas/create-course.json'],
		['../../lib/services/validation/schemas/create-grade.json', 'createGrade'],
		['../../lib/services/validation/schemas/edit-category.json', 'editCategory'],
		['../../lib/services/validation/schemas/edit-course.json', 'editCourse'],
		['../../lib/services/validation/schemas/edit-grade.json', 'editGrade'],
		['../../lib/services/validation/schemas/object-id.json'],
		['../../lib/services/validation/schemas/partial-batch-create-category.json', 'partialCatBatch'],
		['../../lib/services/validation/schemas/partial-course-meta.json', 'partialCourseMeta'],
	];

	const cacheSchema = async schema => {
		const absolutePath = require.resolve(schema[0]);
		const dataForCache = await loadSchema(schema[0], require, schema[1] || 'none');
		schemaCache[absolutePath] = dataForCache;
	};

	await settingsService.init();

	await Promise.all([
		initializeSchemaValidator(),
		Promise.all(schemas.map(schema => cacheSchema(schema))),
	]);
};
