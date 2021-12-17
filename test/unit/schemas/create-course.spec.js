// @ts-check
const {createSchemaValidator} = require('../../utils/schema-validator');

const {expectInvalid, expectValid} = createSchemaValidator('course.create');

const VALID_OBJECT = {
	course: {
		name: 'ECEN 482',
		semester: '2019S',
		credits: 3,
		cutoffs: '{"A":90,"B":80,"C":70,"D":60}',
	},
	categories: [
		{name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null},
		{name: 'Expanded', weight: 60, position: 200, numGrades: 3, dropped: 1},
	],
};

describe('Unit > Schemas > CreateCourse', function () {
	it('base invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'course');
		expectInvalid({id: ''}, ['keyword', 'required'], 'course');
		expectInvalid({...VALID_OBJECT, id: ''}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('course invalid props', function () {
		const object = {...VALID_OBJECT};

		object.course.id = '';
		expectInvalid(object, ['keyword', 'additionalProperties'], 'NOT have additional properties');
		delete object.course.id;

		delete object.course.credits;
		expectInvalid(object, ['keyword', 'required'], 'credits');
		object.course.credits = 3;
	});

	it('course.name', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/course/name'];

		object.course.name = '';
		expectInvalid(object, errorProp, 'must match pattern');

		// @ts-expect-error we're testing a broken case!
		object.course.name = 14;
		expectInvalid(object, errorProp, 'string');

		object.course.name = null;
		expectInvalid(object, errorProp, 'string');

		object.course.name = 'Introduction to Gradebook';
		expectInvalid(object, errorProp, 'must match pattern');

		object.course.name = 'ECEN 482';
		expectValid(object);
	});

	it('course.semester', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/course/semester'];

		object.course.semester = 'Fall 2019';
		expectInvalid(object, errorProp, 'must match pattern');

		object.course.semester = '2019T';
		expectInvalid(object, errorProp, 'must match pattern');

		object.course.semester = '2019F';
		expectValid(object);
	});

	it('category invalid props', function () {
		const object = {...VALID_OBJECT};

		object.categories[0].id = '';
		expectInvalid(object, ['keyword', 'additionalProperties'], 'NOT have additional properties');
		delete object.categories[0].id;

		delete object.categories[0].dropped;
		expectInvalid(object, ['keyword', 'minProperties'], 'NOT have fewer than 5 items');
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
