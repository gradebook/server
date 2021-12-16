const objectId = require('bson-objectid');
const schemaValidator = require('../../utils/schema-validator');

const objectIdSchema = '../../../lib/services/validation/schemas/object-id.json';
const schema = '../../../lib/services/validation/schemas/create-category.json';
const VALID_OBJECT = {
	course: objectId().toString(),
	name: 'Homework',
	weight: 25,
	position: 100,
	grades: [{name: 'Homework 1', grade: 95}, {name: 'Homework 2', grade: 99}],
};

describe('Unit > Schemas > CreateCategory', function () {
	/** @type {ReturnType<schemaValidator>['expectInvalid']} */
	let expectInvalid;
	/** @type {ReturnType<schemaValidator>['expectValid']} */
	let expectValid;

	before(function () {
		({expectInvalid, expectValid} = schemaValidator(schema, require, [objectIdSchema]));
	});

	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'course');
	});

	it('name', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/name'];

		expectValid(object);

		object.name = '';
		expectInvalid(object, errorProp, 'fewer');

		object.name = 14;
		expectInvalid(object, errorProp, 'string');

		object.name = null;
		expectValid(object);
	});

	it('weight', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/weight'];

		object.weight = false;
		expectInvalid(object, errorProp, 'must be number');

		object.weight = '185';
		expectInvalid(object, errorProp, 'must be number');

		object.weight = -1;
		expectInvalid(object, errorProp, '>= 0');

		object.weight = 10_001;
		expectInvalid(object, errorProp, '<= 10000');

		object.weight = 0;
		expectValid(object);

		object.weight = 10_000;
		expectValid(object);

		object.weight = 88.5;
		expectValid(object);
	});

	it('position', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/position'];

		object.position = null;
		expectValid(object);

		object.position = false;
		expectInvalid(object, errorProp, 'must be integer');

		object.position = 0;
		expectValid(object);
	});

	it('grades', function () {
		const object = {...VALID_OBJECT};

		object.grades = [{name: null, grade: 50}];
		expectValid(object);

		delete object.grades;
		expectInvalid(object, ['keyword', 'required'], 'required property \'grades\'');
	});
});
