
// @ts-check
const {expect} = require('chai');
const testUtils = require('../../utils');
const validator = require('../../../lib/database/validator');
const schema = require('../../../lib/database/schema');
const {ValidationError} = require('../../../lib/errors');

class FakeModel {
	constructor() {
		this.data = {
			id: 'a'.repeat(24),
			optional: 'o'.repeat(24),
			text: 't'.repeat(24),
			created: '2020-02-01',
			dropped: 34,
			tinyInt: 0,
			integer: 0,
			float: 12.15,
			grade: 100,
			boolean: true
		};

		this._changed = {};
	}

	get(key) {
		return this.data[key];
	}

	set(key, value) {
		this._changed[key] = value;
	}

	changed(key) {
		return key in this._changed;
	}
}

/**
 * @param {import('../../../lib/database/validator').MinimumViableModel} model
 * @param {'insert' | 'update'} method
 */
const runTest = (model, method = 'insert') => {
	validator.validateRow('__test__', model, {method});
};

describe('Unit > Validator', function () {
	let testSchema;

	before(function () {
		testSchema = {
			// NOTE: only using fields required by the validator
			id: {type: 'string', maxLength: 24, nullable: false},
			optional: {type: 'string', maxLength: 24, nullable: true},
			text: {type: 'text', nullable: false, validations: {maxLength: 24}},
			created: {type: 'datetime', nullable: false},
			dropped: {type: 'tinyint', nullable: true, fallback: null, validations: {between: [1, 40]}},
			tinyInt: {type: 'tinyint'},
			integer: {type: 'integer'},
			float: {type: 'float'},
			grade: {type: 'float', nullable: true, validations: {between: [0, 999999]}},
			boolean: {type: 'boolean'}
		};

		// @ts-expect-error
		schema.__test__ = testSchema;
	});

	after(function () {
		// @ts-expect-error
		delete schema.__test__;
	});

	describe('numeric types have out-of-bounds protection', function () {
		function wrapRunTest(property, value, expectFailure = false) {
			const model = new FakeModel();

			model.data[property] = value;

			if (expectFailure) {
				try {
					runTest(model);
					testUtils.expectError();
				} catch (error) {
					expect(error).to.be.instanceof(ValidationError);
					expect(error.context).to.be.an('array');
					expect(error.context[0]).to.contain(`${property} is not within the allowed range`);
					expect(model._changed).to.be.empty;
				}
			} else {
				runTest(model);
			}
		}

		it('tinyInt', function () {
			const testType = 'tinyInt';
			wrapRunTest(testType, -129, true);
			wrapRunTest(testType, -128, false);
			wrapRunTest(testType, 127, false);
			wrapRunTest(testType, 128, true);

			try {
				testSchema[testType].unsigned = true;
				wrapRunTest(testType, -1, true);
				wrapRunTest(testType, 0, false);
				wrapRunTest(testType, 255, false);
				wrapRunTest(testType, 256, true);
			} finally {
				delete testSchema[testType].unsigned;
			}

			try {
				testSchema[testType].validations = {
					between: [0, 1]
				};

				wrapRunTest(testType, -1, true);
				wrapRunTest(testType, 0, false);
				wrapRunTest(testType, 1, false);
				wrapRunTest(testType, 2, true);
			} finally {
				delete testSchema[testType].validations;
			}
		});

		it('integer', function () {
			const testType = 'integer';
			wrapRunTest(testType, -2147483649, true);
			wrapRunTest(testType, -2147483648, false);
			wrapRunTest(testType, 2147483647, false);
			wrapRunTest(testType, 2147483648, true);

			try {
				testSchema[testType].unsigned = true;
				wrapRunTest(testType, -1, true);
				wrapRunTest(testType, 0, false);
				wrapRunTest(testType, 4294967295, false);
				wrapRunTest(testType, 4294967296, true);
			} finally {
				delete testSchema[testType].unsigned;
			}
		});

		it('float', function () {
			const testType = 'float';
			wrapRunTest(testType, -1000000.01, true);
			wrapRunTest(testType, -999999, false);
			wrapRunTest(testType, 999999, false);
			wrapRunTest(testType, 1000000.01, true);

			try {
				testSchema[testType].unsigned = true;
				wrapRunTest(testType, -1, true);
				wrapRunTest(testType, 0, false);
				wrapRunTest(testType, 999999, false);
				wrapRunTest(testType, 1000000.01, true);
			} finally {
				delete testSchema[testType].unsigned;
			}
		});
	});

	it('numeric check handles empty values', function () {
		const model = new FakeModel();

		model.data.tinyInt = undefined;

		try {
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('tinyInt cannot be empty');
			expect(model._changed).to.be.empty;
		}

		try {
			testSchema.tinyInt.nullable = true;
			runTest(model);
			expect(model._changed.tinyInt).to.equal(null);

			testSchema.tinyInt.fallback = 10;
			runTest(model);
			expect(model._changed.tinyInt).to.equal(10);
		} finally {
			delete testSchema.tinyInt.fallback;
			delete testSchema.tinyInt.nullable;
		}
	});

	it('boolean checks properly reject and coerce values', function () {
		const model = new FakeModel();

		model.data.boolean = undefined;

		try {
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('boolean cannot be empty');
			expect(model._changed).to.be.empty;
		}

		model.data.boolean = false;
		runTest(model);
		expect(model._changed.boolean).to.equal(undefined);

		// @ts-expect-error
		model.data.boolean = 'false';
		runTest(model);
		expect(model._changed.boolean).to.equal(false);

		// @ts-expect-error
		model.data.boolean = '0';
		runTest(model);
		expect(model._changed.boolean).to.equal(false);

		delete model._changed.boolean;
		model.data.boolean = true;
		runTest(model);
		expect(model._changed.boolean).to.equal(undefined);

		// @ts-expect-error
		model.data.boolean = 'true';
		runTest(model);
		expect(model._changed.boolean).to.equal(true);

		// @ts-expect-error
		model.data.boolean = '1';
		runTest(model);
		expect(model._changed.boolean).to.equal(true);

		try {
			// @ts-expect-error
			model.data.boolean = 'potato';
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('boolean must be Boolean');
		}
	});

	it('null-ish values are accepted for nullable columns', function () {
		const model = new FakeModel();

		model.data.optional = null;

		runTest(model);
	});

	it('null-ish values are rejected for non-nullable columns', function () {
		const model = new FakeModel();

		model.data.id = null;

		try {
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('id cannot be null');
			expect(model._changed).to.be.empty;
		}

		model.data.id = '';

		try {
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('id cannot be empty');
			expect(model._changed).to.be.empty;
		}
	});

	it('maxLength - strings and text blobs', function () {
		const model = new FakeModel();

		model.data.id = 'b'.repeat(25);

		// Strings (part of the schema)
		try {
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('id exceeds the maxLength');
			expect(model._changed).to.be.empty;
		}

		model.data.id = 'a'.repeat(24);
		model.data.optional = 'b'.repeat(25);

		// Blobs (part of the additional validations)
		try {
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('optional exceeds the maxLength');
			expect(model._changed).to.be.empty;
		}

		// Generic
		model.data.optional = 'o'.repeat(24);

		runTest(model);
		expect(model._changed).to.be.empty;
	});

	it('additional validation - between ', function () {
		const model = new FakeModel();

		model.data.dropped = 1;
		runTest(model);

		model.data.dropped = 40;
		runTest(model);

		model.data.dropped = 0;

		try {
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('dropped is not within the allowed range');
			expect(model._changed).to.be.empty;
		}

		model.data.dropped = 41;

		try {
			runTest(model);
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.be.an('array');
			expect(error.context[0]).to.contain('dropped is not within the allowed range');
			expect(model._changed).to.be.empty;
		}
	});
});
