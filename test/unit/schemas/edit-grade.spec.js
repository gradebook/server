const schemaValidator = require('../../utils/schema-validator');

const schema = '../../../lib/services/validation/schemas/edit-grade.json';

describe('Unit > Schemas > EditGrade', function () {
	/** @type {ReturnType<schemaValidator>['expectInvalid']} */
	let expectInvalid;
	/** @type {ReturnType<schemaValidator>['expectValid']} */
	let expectValid;

	before(function () {
		({expectInvalid, expectValid} = schemaValidator(schema, require));
	});

	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'name');
		expectInvalid({id: ''}, ['keyword', 'required'], 'name');
		expectInvalid({name: '', id: ''}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('name', function () {
		const object = {name: ''};
		const errorProp = ['instancePath', '/name'];

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
		const object = {grade: ''};
		const errorProp = ['instancePath', '/grade'];

		expectInvalid(object, errorProp, 'must be number');

		object.grade = false;
		expectInvalid(object, errorProp, 'must be number');

		object.grade = '15';
		expectInvalid(object, errorProp, 'must be number');

		object.grade = 88.3;
		expectValid(object);

		object.grade = 1000;
		expectValid(object);
	});
});
