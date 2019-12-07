const AJV = require('ajv');

module.exports = function createSchemaValidator(schema, additionalSchemas = []) {
	const ajv = new AJV();
	for (const helperSchema of additionalSchemas) {
		ajv.addSchema(helperSchema);
	}

	return {
		expectValid(payload) {
			expect(ajv.validate(schema, payload)).to.be.ok;
		},

		expectInvalid(payload, kv = [], messageMatch = '') {
			expect(ajv.validate(schema, payload)).to.not.be.ok;
			expect(kv.length, 'Error is properly validated').to.equal(2);

			const {errors} = ajv;
			const [key, value] = kv;
			expect(errors[0][key]).to.equal(value);
			expect(errors[0].message).to.contain(messageMatch);
		}
	};
};
