const schemaValidator = require('../../utils/schema-validator');
const cutSchema = require('../../../lib/services/validation/schemas/course-cut.json');
const schema = require('../../../lib/services/validation/schemas/edit-course.json');

describe('Unit > Schemas > EditCourse', function () {
	const {expectInvalid, expectValid} = schemaValidator(schema, [cutSchema]);

	it('protected props', function () {
		expectInvalid({}, ['keyword', 'minProperties'], 'have fewer than 1');
		expectInvalid({semester: '2019S'}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('name', function () {
		expectValid({name: 'ECEN 482'});
		expectValid({name: 'ECE 1241'});
		expectInvalid({name: 'Introduction to Gradebook'}, ['dataPath', '.name'], 'should match pattern');
	});

	it('allows changing different permutations', function () {
		expectValid({name: 'ECEN 500'});
		expectValid({cut1: 120});
		expectValid({cut2: 40});
		expectValid({cut3: 84});
		expectValid({cut4: 94});
	});
});
