// @ts-check
import {createSchemaValidator} from '../../utils/schema-validator.js';

const {expectInvalid, expectValid} = createSchemaValidator('category.edit');

describe('Unit > Schemas > EditCategory', function () {
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
