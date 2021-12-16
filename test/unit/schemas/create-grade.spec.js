const objectID = require('bson-objectid');
const schemaValidator = require('../../utils/schema-validator');

const COURSE_ID = objectID().toString();
const CATEGORY_ID = objectID().toString();
const objectIdSchema = '../../../lib/services/validation/schemas/object-id.json';
const schema = '../../../lib/services/validation/schemas/create-grade.json';

const VALID_OBJECT = {course: COURSE_ID, category: CATEGORY_ID, name: 'Project 1'};

describe('Unit > Schemas > CreateGrade', function () {
	/** @type {ReturnType<schemaValidator>['expectInvalid']} */
	let expectInvalid;
	/** @type {ReturnType<schemaValidator>['expectValid']} */
	let expectValid;

	before(function () {
		({expectInvalid, expectValid} = schemaValidator(schema, require, [objectIdSchema]));
	});

	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'course');
		expectInvalid({id: ''}, ['keyword', 'required'], 'course');
		expectInvalid({...VALID_OBJECT, course: 'abcd'}, ['instancePath', '/course'], 'must match pattern');
	});

	it('name', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/name'];

		object.name = '';
		expectInvalid(object, errorProp, 'fewer than 1 character');

		object.name = 14;
		expectInvalid(object, errorProp, 'must be string');

		object.name = false;
		expectInvalid(object, errorProp, 'must be string');

		object.name = null;
		expectInvalid(object, errorProp, 'must be string');

		object.name = 'Project 1';
		expectValid(object);
	});

	it('grade', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/grade'];

		object.grade = '';
		expectInvalid(object, errorProp, '');

		object.grade = false;
		expectInvalid(object, errorProp, '');

		object.grade = '15';
		expectInvalid(object, errorProp, '');

		object.grade = 88.3;
		expectValid(object);

		object.grade = 1000;
		expectValid(object);
	});
});
