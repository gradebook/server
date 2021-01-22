const schemaValidator = require('../../utils/schema-validator');
const schema = require('../../../lib/services/validation/schemas/import-course.json');
const courseCreateSchema = require('../../../lib/services/validation/schemas/create-course.json');

const {expectInvalid, expectValid} = schemaValidator(schema, [courseCreateSchema]);
const VALID_OBJECT = {
	course: {
		name: 'ECEN 482',
		semester: '2019S',
		credits: 3,
		cutoffs: '{"A":90,"B":80,"C":70,"D":60}'
	},
	categories: [
		{name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null},
		{name: 'Expanded', weight: 60, position: 200, numGrades: 3, dropped: 1}
	]
};

describe('Unit > Schemas > ImportCourse', function () {
	it('base invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'course');
		expectInvalid({id: ''}, ['keyword', 'required'], 'course');
		expectInvalid({...VALID_OBJECT, id: ''}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('course invalid props', function () {
		const obj = {...VALID_OBJECT};

		obj.course.id = '';
		expectInvalid(obj, ['keyword', 'additionalProperties'], 'NOT have additional properties');
		delete obj.course.id;

		delete obj.course.credits;
		expectInvalid(obj, ['keyword', 'required'], 'credits');
		obj.course.credits = 3;
	});

	it('course.name', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/course/name'];

		obj.course.name = '';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.course.name = 14;
		expectInvalid(obj, errorProp, 'string');

		obj.course.name = null;
		expectInvalid(obj, errorProp, 'string');

		obj.course.name = 'Introduction to Gradebook';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.course.name = 'ECEN 482';
		expectValid(obj);
	});

	it('course.semester', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/course/semester'];

		obj.course.semester = 'Fall 2019';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.course.semester = '2019T';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.course.semester = '2019F';
		expectValid(obj);
	});

	it('category invalid props', function () {
		const obj = {...VALID_OBJECT};

		obj.categories[0].id = '';
		expectInvalid(obj, ['keyword', 'additionalProperties'], 'NOT have additional properties');
		delete obj.categories[0].id;

		delete obj.categories[0].dropped;
		expectInvalid(obj, ['keyword', 'minProperties'], 'NOT have fewer than 5 items');
		obj.categories[0].dropped = null;
	});

	it('name', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/categories/1/name'];

		expectValid(obj);

		obj.categories[1].name = '';
		expectInvalid(obj, errorProp, 'fewer');

		obj.categories[1].name = 14;
		expectInvalid(obj, errorProp, 'string');

		obj.categories[1].name = null;
		expectValid(obj);
	});

	it('weight', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/categories/0/weight'];

		obj.categories[0].weight = false;
		expectInvalid(obj, errorProp, 'should be number');

		obj.categories[0].weight = '185';
		expectInvalid(obj, errorProp, 'should be number');

		obj.categories[0].weight = -1;
		expectInvalid(obj, errorProp, '>= 0');

		obj.categories[0].weight = 10001;
		expectInvalid(obj, errorProp, '<= 10000');

		obj.categories[0].weight = 0;
		expectValid(obj);

		obj.categories[0].weight = 10000;
		expectValid(obj);

		obj.categories[0].weight = 88.5;
		expectValid(obj);
	});

	it('position', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/categories/1/position'];

		obj.categories[1].position = null;
		expectValid(obj);

		obj.categories[1].position = false;
		expectInvalid(obj, errorProp, 'should be integer');

		obj.categories[1].position = 0;
		expectValid(obj);
	});

	it('numGrades', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/categories/1/numGrades'];

		obj.categories[1].numGrades = null;
		expectInvalid(obj, errorProp, 'should be integer');

		obj.categories[1].numGrades = false;
		expectInvalid(obj, errorProp, 'should be integer');

		obj.categories[1].numGrades = 0;
		expectInvalid(obj, errorProp, 'should be >= 1');

		obj.categories[1].numGrades = 3;
		expectValid(obj);
	});

	it('dropped', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '/categories/1/dropped'];

		obj.categories[1].dropped = null;
		expectValid(obj);

		obj.categories[1].dropped = false;
		expectInvalid(obj, errorProp, 'should be integer');

		obj.categories[1].dropped = -1;
		expectInvalid(obj, errorProp, 'should be >= 0');

		obj.categories[1].dropped = 1;
		expectValid(obj);
	});
});
