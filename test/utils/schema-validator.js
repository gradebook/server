// @ts-check
import {expect} from 'chai';
import {settings} from '../../lib/services/settings/index.js';
import validator, {init as initValidator} from '../../lib/services/validation/schema-validator.js';
import * as testConfig from './test-config.js';

/**
 * @param {string} schemaName
 */
export const createSchemaValidator = schemaName => ({
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

export async function preFetch() {
	await settings.init();
	await initValidator();
}
