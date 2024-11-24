// @ts-check
import {createSchemaValidator} from '../../utils/schema-validator.js';

const {expectInvalid, expectValid} = createSchemaValidator('course.create.complete');

const VALID_OBJECT = {
	categories: [
		{
			name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null,
		},
		{
			name: 'Expanded', weight: 60, position: 200, numGrades: 3, dropped: 1,
		},
	],
};

// These tests should closely mirror create-course.spec.js (just excluding course validations)
// The only reason these exist are to make sure the complete-course-create schema is also correct
describe('Unit > Schemas > CompleteCreateCourse', function () {
	it('category invalid props', function () {
		const object = {...VALID_OBJECT};

		object.categories[0].id = '';
		expectInvalid(object, ['keyword', 'additionalProperties'], 'NOT have additional properties');
		delete object.categories[0].id;

		delete object.categories[0].dropped;
		expectInvalid(object, ['keyword', 'minProperties'], 'NOT have fewer than 5 properties');
		object.categories[0].dropped = null;
	});

	it('name', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/categories/1/name'];

		expectValid(object);

		object.categories[1].name = '';
		expectInvalid(object, errorProp, 'fewer');

		// @ts-expect-error we're testing a broken case!
		object.categories[1].name = 14;
		expectInvalid(object, errorProp, 'string');

		object.categories[1].name = null;
		expectValid(object);
	});

	it('weight', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/categories/0/weight'];

		// @ts-expect-error we're testing a broken case!
		object.categories[0].weight = false;
		expectInvalid(object, errorProp, 'must be number');

		// @ts-expect-error we're testing a broken case!
		object.categories[0].weight = '185';
		expectInvalid(object, errorProp, 'must be number');

		object.categories[0].weight = -1;
		expectInvalid(object, errorProp, '>= 0');

		object.categories[0].weight = 10_001;
		expectInvalid(object, errorProp, '<= 10000');

		object.categories[0].weight = 0;
		expectValid(object);

		object.categories[0].weight = 10_000;
		expectValid(object);

		object.categories[0].weight = 88.5;
		expectValid(object);
	});

	it('position', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/categories/1/position'];

		object.categories[1].position = null;
		expectValid(object);

		// @ts-expect-error we're testing a broken case!
		object.categories[1].position = false;
		expectInvalid(object, errorProp, 'must be integer');

		object.categories[1].position = 0;
		expectValid(object);
	});

	it('numGrades', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/categories/1/numGrades'];

		object.categories[1].numGrades = null;
		expectInvalid(object, errorProp, 'must be integer');

		// @ts-expect-error we're testing a broken case!
		object.categories[1].numGrades = false;
		expectInvalid(object, errorProp, 'must be integer');

		object.categories[1].numGrades = 0;
		expectInvalid(object, errorProp, 'must be >= 1');

		object.categories[1].numGrades = 3;
		expectValid(object);
	});

	it('dropped', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/categories/1/dropped'];

		object.categories[1].dropped = null;
		expectValid(object);

		// @ts-expect-error we're testing a broken case!
		object.categories[1].dropped = false;
		expectInvalid(object, errorProp, 'must be integer');

		object.categories[1].dropped = -1;
		expectInvalid(object, errorProp, 'must be >= 0');

		object.categories[1].dropped = 1;
		expectValid(object);
	});
});
