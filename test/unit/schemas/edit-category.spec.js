// @ts-check
const schemaValidator = require('../../utils/schema-validator');

const schema = '../../../lib/services/validation/schemas/edit-category.json';

describe('Unit > Schemas > EditCategory', function () {
	/** @type {ReturnType<schemaValidator>['expectInvalid']} */
	let expectInvalid;
	/** @type {ReturnType<schemaValidator>['expectValid']} */
	let expectValid;

	before(function () {
		({expectInvalid, expectValid} = schemaValidator(schema, require));
	});

	it('protected props', function () {
		expectInvalid({}, ['keyword', 'minProperties'], 'have fewer than 1');
		expectInvalid({course: '2019S'}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('allows changing different permutations', function () {
		expectValid({name: 'Homework'});
		expectValid({weight: 30});
		expectValid({position: 150});
	});
});
