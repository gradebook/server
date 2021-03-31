const schemaValidator = require('../../utils/schema-validator');
const schema = require('../../../lib/services/validation/schemas/edit-grade.json');

const {expectValid, expectInvalid} = schemaValidator(schema);

describe('Unit > Schemas > EditGrade', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'name');
		expectInvalid({id: ''}, ['keyword', 'required'], 'name');
		expectInvalid({name: '', id: ''}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('name', function () {
		const obj = {name: ''};
		const errorProp = ['instancePath', '/name'];

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
		const obj = {grade: ''};
		const errorProp = ['instancePath', '/grade'];

		expectInvalid(obj, errorProp, 'must be number');

		obj.grade = false;
		expectInvalid(obj, errorProp, 'must be number');

		obj.grade = '15';
		expectInvalid(obj, errorProp, 'must be number');

		obj.grade = 88.3;
		expectValid(obj);

		obj.grade = 1000;
		expectValid(obj);
	});
});
