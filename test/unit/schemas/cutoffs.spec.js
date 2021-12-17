// @ts-check
const {createSchemaValidator} = require('../../utils/schema-validator');

const {expectInvalid, expectValid} = createSchemaValidator('course.cutoffs');

/** @type {Record<string, any>} */
const VALID_OBJECT = {
	A: 90,
	'B+': 80,
	C: 70.45,
	D: 600,
};

describe('Unit > Schemas > Cutoffs', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'minProperties'], '4');
	});

	const object = {...VALID_OBJECT};
	const errorProp = ['keyword', 'enum'];

	it('valid cutoffs', function () {
		expectValid(object);
	});

	it('invalid cutoff names', function () {
		object.null = 90;
		expectInvalid(object, errorProp, '');
		delete object.null;

		object.FFF = 90;
		expectInvalid(object, errorProp, '');
		delete object.FFF;

		object[''] = 90;
		expectInvalid(object, errorProp, '');
		delete object[''];
	});

	it('invalid cutoff values', function () {
		const errorProp = ['instancePath', '/A'];

		object.A = null;
		expectInvalid(object, errorProp, '');

		object.A = '';
		expectInvalid(object, errorProp, '');

		object.A = 10_001;
		expectInvalid(object, errorProp, '');

		object.A = 9;
		expectInvalid(object, errorProp, '');
	});
});
