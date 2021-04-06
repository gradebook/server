const objectID = require('bson-objectid');
const schemaValidator = require('../../utils/schema-validator');
const objSchema = require('../../../lib/services/validation/schemas/object-id.json');
const schema = require('../../../lib/services/validation/schemas/create-grade.json');

const COURSE_ID = objectID().toString();
const CATEGORY_ID = objectID().toString();

const {expectValid, expectInvalid} = schemaValidator(schema, [objSchema]);
const VALID_OBJECT = {course: COURSE_ID, category: CATEGORY_ID, name: 'Project 1'};

describe('Unit > Schemas > CreateGrade', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'course');
		expectInvalid({id: ''}, ['keyword', 'required'], 'course');
		expectInvalid({...VALID_OBJECT, course: 'abcd'}, ['instancePath', '/course'], 'must match pattern');
	});

	it('name', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/name'];

		obj.name = '';
		expectInvalid(obj, errorProp, 'fewer than 1 character');

		obj.name = 14;
		expectInvalid(obj, errorProp, 'must be string');

		obj.name = false;
		expectInvalid(obj, errorProp, 'must be string');

		obj.name = null;
		expectInvalid(obj, errorProp, 'must be string');

		obj.name = 'Project 1';
		expectValid(obj);
	});

	it('grade', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/grade'];

		obj.grade = '';
		expectInvalid(obj, errorProp, '');

		obj.grade = false;
		expectInvalid(obj, errorProp, '');

		obj.grade = '15';
		expectInvalid(obj, errorProp, '');

		obj.grade = 88.3;
		expectValid(obj);

		obj.grade = 1000;
		expectValid(obj);
	});
});
