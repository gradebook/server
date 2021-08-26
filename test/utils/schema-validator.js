const AJV = require('ajv').default;

module.exports = function createSchemaValidator(schema, additionalSchemas = []) {
	const ajv = new AJV();
	for (const helperSchema of additionalSchemas) {
		ajv.addSchema(helperSchema);
	}

	return {
		expectValid(payload) {
			expect(ajv.validate(schema, payload)).to.be.ok;
		},

		expectInvalid(payload, kv = [], messageMatch = '', logError = false) {
			if ('CI' in process.env) {
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
