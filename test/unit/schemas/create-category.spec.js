const ObjectId = require('bson-objectid');
const schemaValidator = require('../../utils/schema-validator');
const objSchema = require('../../../lib/services/validation/schemas/object-id.json');
const schema = require('../../../lib/services/validation/schemas/create-category.json');

const {expectInvalid, expectValid} = schemaValidator(schema, [objSchema]);
const VALID_OBJECT = {
	course: ObjectId.generate(),
	name: 'Homework',
	weight: 25,
	position: 100,
	grades: [{name: 'Homework 1', grade: 95}, {name: 'Homework 2', grade: 99}]
};

describe('Unit > Schemas > CreateCategory', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'course');
	});

	it('name', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/name'];

		expectValid(obj);

		obj.name = '';
		expectInvalid(obj, errorProp, 'fewer');

		obj.name = 14;
		expectInvalid(obj, errorProp, 'string');

		obj.name = null;
		expectValid(obj);
	});

	it('weight', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/weight'];

		obj.weight = false;
		expectInvalid(obj, errorProp, 'should be number');

		obj.weight = '185';
		expectInvalid(obj, errorProp, 'should be number');

		obj.weight = -1;
		expectInvalid(obj, errorProp, '>= 0');

		obj.weight = 10001;
		expectInvalid(obj, errorProp, '<= 10000');

		obj.weight = 0;
		expectValid(obj);

		obj.weight = 10000;
		expectValid(obj);

		obj.weight = 88.5;
		expectValid(obj);
	});

	it('position', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/position'];

		obj.position = null;
		expectValid(obj);

		obj.position = false;
		expectInvalid(obj, errorProp, 'should be integer');

		obj.position = 0;
		expectValid(obj);
	});

	it('grades', function () {
		const obj = {...VALID_OBJECT};

		obj.grades = [{name: null, grade: 50}];
		expectValid(obj);

		delete obj.grades;
		expectInvalid(obj, ['keyword', 'required'], 'required property \'grades\'');
	});
});
