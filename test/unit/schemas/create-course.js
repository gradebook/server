const schemaValidator = require('../../utils/schema-validator');
const schema = require('../../../lib/services/validation/schemas/create-course.json');

const {expectInvalid, expectValid} = schemaValidator(schema);
const VALID_OBJECT = {
	name: 'ECEN 482',
	semester: '2019S',
	cutoffs: '{"A":90,"B":80,"C":70,"D":60}',
	credits: 3
};

describe('Unit > Schemas > CreateCourse', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'minProperties'], '4');
	});

	it('name', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '.name'];

		obj.name = '';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.name = 14;
		expectInvalid(obj, errorProp, 'string');

		obj.name = null;
		expectInvalid(obj, errorProp, 'string');

		obj.name = 'Introduction to Gradebook';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.name = 'ECEN 482';
		expectValid(obj);
	});

	it('semester', function () {
		const obj = {...VALID_OBJECT, semester: 'Fall 2019'};
		const errorProp = ['dataPath', '.semester'];

		expectInvalid(obj, errorProp, 'should match pattern');

		obj.semester = '2019T';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.semester = '2019F';
		expectValid(obj);
	});
});
