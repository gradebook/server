const schemaValidator = require('../../utils/schema-validator');
const schema = require('../../../lib/services/validation/schemas/edit-grade.json');

const {expectValid, expectInvalid} = schemaValidator(schema);

describe('Unit > Schemas > EditGrade', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'name');
		expectInvalid({id: ''}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('name', function () {
		const obj = {name: ''};
		const errorProp = ['dataPath', '.name'];

		expectInvalid(obj, errorProp, 'shorter than 1 character');

		obj.name = 14;
		expectInvalid(obj, errorProp, 'should be string');

		obj.name = false;
		expectInvalid(obj, errorProp, 'should be string');

		obj.name = null;
		expectValid(obj);

		obj.name = 'Project 1';
		expectValid(obj);
	});

	it('grade', function () {
		const obj = {grade: ''};
		const errorProp = ['dataPath', '.grade'];

		expectInvalid(obj, errorProp, 'should be number');

		obj.grade = false;
		expectInvalid(obj, errorProp, 'should be number');

		obj.grade = '15';
		expectInvalid(obj, errorProp, 'should be number');

		obj.grade = 88.3;
		expectValid(obj);

		obj.grade = 1000;
		expectValid(obj);
	});
});
