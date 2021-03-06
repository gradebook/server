const schemaValidator = require('../../utils/schema-validator');
const schema = require('../../../lib/services/validation/schemas/course-cutoffs.json');

const {expectInvalid, expectValid} = schemaValidator(schema);
const VALID_OBJECT = {
	A: 90,
	'B+': 80,
	C: 70.45,
	D: 600
};

describe('Unit > Schemas > Cutoffs', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'minProperties'], '4');
	});

	const obj = {...VALID_OBJECT};
	const errorProp = ['keyword', 'enum'];

	it('valid cutoffs', function () {
		expectValid(obj);
	});

	it('invalid cutoff names', function () {
		obj.null = 90;
		expectInvalid(obj, errorProp, '');
		delete obj.null;

		obj.FFF = 90;
		expectInvalid(obj, errorProp, '');
		delete obj.FFF;

		obj[''] = 90;
		expectInvalid(obj, errorProp, '');
		delete obj[''];
	});

	it('invalid cutoff values', function () {
		const errorProp = ['dataPath', '/A'];

		obj.A = null;
		expectInvalid(obj, errorProp, '');

		obj.A = '';
		expectInvalid(obj, errorProp, '');

		obj.A = 10001;
		expectInvalid(obj, errorProp, '');

		obj.A = 9;
		expectInvalid(obj, errorProp, '');
	});
});
