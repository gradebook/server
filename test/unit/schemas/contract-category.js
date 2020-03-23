const schemaValidator = require('../../utils/schema-validator');
const objSchema = require('../../../lib/services/validation/schemas/object-id.json');
const schema = require('../../../lib/services/validation/schemas/contract-category.json');

const {expectInvalid, expectValid} = schemaValidator(schema, [objSchema]);

describe('Unit > Schemas > ContractCategory', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'grade');
	});

	it('grade', function () {
		const obj = {grade: 100};
		const errorProp = ['dataPath', '.grade'];

		expectValid(obj);

		obj.grade = '';
		expectInvalid(obj, errorProp, 'number');

		obj.grade = true;
		expectInvalid(obj, errorProp, 'number');

		obj.grade = null;
		expectValid(obj);
	});
});
