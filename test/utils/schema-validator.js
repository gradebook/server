// @ts-check
const {expect} = require('chai');
const settingsService = require('../../lib/services/settings/index.js');
const validator = require('../../lib/services/validation/schema-validator.js');
const testConfig = require('./test-config.js');

/**
 * @param {string} schemaName
 */
module.exports.createSchemaValidator = schemaName => ({
	expectValid(payload) {
		expect(validator.validate(schemaName, payload)).to.be.ok;
	},

	expectInvalid(payload, kv = [], messageMatch = '', logError = false) {
		if (testConfig.isCI) {
			expect(logError, 'SchemaValidation: logError is a *debug tool* and should not be used in tests').to.not.be.ok;
		}

		expect(validator.validate(schemaName, payload)).to.not.be.ok;
		expect(kv.length, 'Error is properly validated').to.equal(2);

		const {errors} = validator;
		if (logError) {
			// eslint-disable-next-line no-console
			console.log(errors);
		}

		const [key, value] = kv;
		expect(errors[0][key]).to.equal(value);
		expect(errors[0].message).to.contain(messageMatch);
	},
});

module.exports.preFetch = async function () {
	await settingsService.init();
	// @ts-expect-error
	await validator.init();
};

