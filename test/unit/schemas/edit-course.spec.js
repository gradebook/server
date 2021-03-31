const schemaValidator = require('../../utils/schema-validator');
const schema = require('../../../lib/services/validation/schemas/edit-course.json');

const {expectInvalid, expectValid} = schemaValidator(schema);

describe('Unit > Schemas > EditCourse', function () {
	it('protected props', function () {
		expectInvalid({}, ['keyword', 'minProperties'], 'have fewer than 1');
		expectInvalid({semester: '2019S'}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('name', function () {
		expectValid({name: 'ECEN 482'});
		expectValid({name: 'ECE 1241'});
		expectInvalid({name: 'Introduction to Gradebook'}, ['instancePath', '/name'], 'must match pattern');
	});

	it('allows changing different permutations', function () {
		expectValid({name: 'ECEN 500'});
		expectValid({cutoffs: '{"A":90,"B":80,"C":70,"D":60}'});
	});
});
