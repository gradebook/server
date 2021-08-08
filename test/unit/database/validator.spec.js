
// @ts-check
const {expect} = require('chai');
const testUtils = require('../../utils');
const validator = require('../../../lib/database/validator');
const schema = require('../../../lib/database/schema');
const {ValidationError} = require('../../../lib/errors');

const NO_CHANGE = [null, undefined];

describe('Unit > Validator', function () {
	describe('numeric types have out-of-bounds protection', function () {
		it('tinyInt', function () {
			const schema = {type: 'tinyint'};
			const error = 'tinyInt is not within the allowed range';

			expect(validator._validateSingleColumn(schema, -129, 'tinyInt')).to.deep.equal([error, null]);
			expect(validator._validateSingleColumn(schema, -128, 'tinyInt')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 127, 'tinyInt')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 128, 'tinyInt')).to.deep.equal([error, null]);

			schema.unsigned = true;
			expect(validator._validateSingleColumn(schema, -1, 'tinyInt')).to.deep.equal([error, null]);
			expect(validator._validateSingleColumn(schema, 0, 'tinyInt')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 255, 'tinyInt')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 256, 'tinyInt')).to.deep.equal([error, null]);

			schema.validations = {between: [0, 1]};
			expect(validator._validateSingleColumn(schema, -1, 'tinyInt')).to.deep.equal([error, null]);
			expect(validator._validateSingleColumn(schema, 0, 'tinyInt')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 1, 'tinyInt')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 2, 'tinyInt')).to.deep.equal([error, null]);
		});

		it('integer', function () {
			const schema = {type: 'integer'};
			const error = 'int is not within the allowed range';
			expect(validator._validateSingleColumn(schema, -2_147_483_649, 'int')).to.deep.equal([error, null]);
			expect(validator._validateSingleColumn(schema, -2_147_483_648, 'int')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 2_147_483_647, 'int')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 2_147_483_648, 'int')).to.deep.equal([error, null]);

			schema.unsigned = true;
			expect(validator._validateSingleColumn(schema, -1, 'int')).to.deep.equal([error, null]);
			expect(validator._validateSingleColumn(schema, 0, 'int')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 4_294_967_295, 'int')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 4_294_967_296, 'int')).to.deep.equal([error, null]);
		});

		it('float', function () {
			const schema = {type: 'float'};
			const error = 'float is not within the allowed range';
			expect(validator._validateSingleColumn(schema, -1_000_000.01, 'float')).to.deep.equal([error, null]);
			expect(validator._validateSingleColumn(schema, -999_999, 'float')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 999_999, 'float')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 1_000_000.01, 'float')).to.deep.equal([error, null]);

			schema.unsigned = true;
			expect(validator._validateSingleColumn(schema, -1, 'float')).to.deep.equal([error, null]);
			expect(validator._validateSingleColumn(schema, 0, 'float')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 999_999, 'float')).to.deep.equal(NO_CHANGE);
			expect(validator._validateSingleColumn(schema, 1_000_000.01, 'float')).to.deep.equal([error, null]);
		});
	});

	it('numeric check handles empty values', function () {
		const schema = {type: 'tinyint'};

		expect(
			validator._validateSingleColumn(schema, undefined, 'tinyInt'),
		).to.deep.equal(['tinyInt cannot be empty', null]);

		schema.nullable = true;
		expect(validator._validateSingleColumn(schema, undefined, 'tinyInt')).to.deep.equal([null, null]);

		schema.fallback = 10;
		expect(validator._validateSingleColumn(schema, undefined, 'tinyInt')).to.deep.equal([null, 10]);
	});

	it('boolean checks properly reject and coerce values', function () {
		const schema = {type: 'boolean'};

		expect(
			validator._validateSingleColumn(schema, undefined, 'boolean'),
		).to.deep.equal(['boolean cannot be empty', null]);
		expect(validator._validateSingleColumn(schema, false, 'boolean')).to.deep.equal(NO_CHANGE);
		expect(validator._validateSingleColumn(schema, 'false', 'boolean')).to.deep.equal([null, false]);
		expect(validator._validateSingleColumn(schema, '0', 'boolean')).to.deep.equal([null, false]);
		expect(validator._validateSingleColumn(schema, true, 'boolean')).to.deep.equal(NO_CHANGE);
		expect(validator._validateSingleColumn(schema, 'true', 'boolean')).to.deep.equal([null, true]);
		expect(validator._validateSingleColumn(schema, '1', 'boolean')).to.deep.equal([null, true]);
		expect(
			validator._validateSingleColumn(schema, 'potato', 'boolean'),
		).to.deep.equal(['boolean must be Boolean', null]);
		expect(validator._validateSingleColumn(schema, 2, 'boolean')).to.deep.equal(['boolean must be Boolean', null]);
	});

	it('null-ish values are accepted for nullable columns', function () {
		const schema = {type: 'string', maxLength: 24, nullable: true};
		expect(validator._validateSingleColumn(schema, null, 'optional')).to.deep.equal([null, null]);
	});

	it('null-ish values are rejected for non-nullable columns', function () {
		const schema = {type: 'string', maxLength: 24, nullable: false};
		expect(validator._validateSingleColumn(schema, null, 'id')).to.deep.equal(['id cannot be null', null]);
		expect(validator._validateSingleColumn(schema, '', 'id')).to.deep.equal(['id cannot be empty', null]);
	});

	it('maxLength - strings and text blobs', function () {
		const schema = {type: 'string', maxLength: 24, nullable: false};
		expect(
			validator._validateSingleColumn(schema, 'b'.repeat(25), 'id'),
		).to.deep.equal(['id exceeds the maxLength of 24', null]);

		schema.nullable = true;

		expect(
			validator._validateSingleColumn(schema, 'b'.repeat(25), 'optional'),
		).to.deep.equal(['optional exceeds the maxLength of 24', null]);
		expect(validator._validateSingleColumn(schema, 'o'.repeat(24), 'optional')).to.deep.equal(NO_CHANGE);
	});

	it('additional validation - between ', function () {
		const schema = {type: 'tinyint', nullable: true, fallback: null, validations: {between: [1, 40]}};

		expect(validator._validateSingleColumn(schema, 1, 'dropped')).to.deep.equal(NO_CHANGE);
		expect(validator._validateSingleColumn(schema, 40, 'dropped')).to.deep.equal(NO_CHANGE);
		expect(
			validator._validateSingleColumn(schema, 0, 'dropped'),
		).to.deep.equal(['dropped is not within the allowed range', null]);
		expect(
			validator._validateSingleColumn(schema, 41, 'dropped'),
		).to.deep.equal(['dropped is not within the allowed range', null]);
	});

	it('general model validation works', function () {
		const testSchema = {
			// NOTE: only using fields required by the validator
			id: {type: 'string', maxLength: 24, nullable: false},
			optional: {type: 'string', maxLength: 24, nullable: true},
			text: {type: 'text', nullable: false, validations: {maxLength: 24}},
			created: {type: 'datetime', nullable: false},
			dropped: {type: 'tinyint', nullable: true, fallback: null, validations: {between: [1, 40]}},
			tinyInt: {type: 'tinyint', fallback: 15},
			integer: {type: 'integer'},
			float: {type: 'float'},
			grade: {type: 'float', nullable: true, validations: {between: [0, 999_999]}},
			boolean: {type: 'boolean'},
		};

		// @ts-expect-error
		schema.__test__ = testSchema;
		const original = {
			id: '25',
			optional: 51,
			text: 'c'.repeat(25),
			dropped: null,
			integer: -10,
			float: 1.05,
			grade: -1,
			boolean: false,
		};
		const columns = Object.keys(testSchema);

		const diff = {};
		const set = (key, value) => {
			diff[key] = value;
		};

		const get = key => original[key];

		try {
			const model = {set, get, columns};
			validator('__test__', model, {method: 'insert'});
			testUtils.expectError();
		} catch (error) {
			expect(error).to.be.instanceof(ValidationError);
			expect(error.context).to.deep.equal([
				'__test__.text exceeds the maxLength of 24',
				'__test__.created cannot be empty',
				'__test__.grade is not within the allowed range',
			]);
			expect(diff).to.deep.equal({
				optional: '51',
				dropped: null,
				tinyInt: 15,
			});
		} finally {
			// @ts-expect-error
			delete schema.__test__;
		}
	});
});
