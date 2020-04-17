const schemaValidator = require('../../utils/schema-validator');
const cutSchema = require('../../../lib/services/validation/schemas/course-cut.json');
const cutNameSchema = require('../../../lib/services/validation/schemas/course-cut-name.json');
const schema = require('../../../lib/services/validation/schemas/import-course.json');

const {expectInvalid, expectValid} = schemaValidator(schema, [cutSchema, cutNameSchema]);
const VALID_OBJECT = {
	course: {
		name: 'ECEN 482',
		semester: '2019S',
		credits: 3,
		cut1: 90,
		cut2: 80,
		cut3: 70,
		cut4: 60,
		cut1Name: 'A+',
		cut2Name: 'B',
		cut3Name: 'D-',
		cut4Name: 'C+'
	},
	categories: [
		{name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null},
		{name: 'Expanded', weight: 60, position: 200, numGrades: 3, dropped: 1}
	]
};

describe('Unit > Schemas > ImportCourse', function () {
	it('base invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'course');
		expectInvalid({id: ''}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('course invalid props', function () {
		const obj = {...VALID_OBJECT};

		obj.course.id = '';
		expectInvalid(obj, ['keyword', 'additionalProperties'], 'NOT have additional properties');
		delete obj.course.id;

		delete obj.course.credits;
		expectInvalid(obj, ['keyword', 'minProperties'], 'NOT have fewer than 11 properties');
		obj.course.credits = 3;
	});

	it('course.name', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '.course.name'];

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
		const errorProp = ['dataPath', '.course.semester'];

		obj.course.semester = 'Fall 2019';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.course.semester = '2019T';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.course.semester = '2019F';
		expectValid(obj);
	});

	describe('course.cut', function () {
		const cuts = ['1', '2', '3', '4'];
		const errorProp = ['dataPath', ''];
		const validRequest = {...VALID_OBJECT};

		for (const cut of cuts) {
			it(cut, function () {
				const obj = {...validRequest};
				const key = `cut${cut}`;
				errorProp[1] = `.course.${key}`;

				obj.course[key] = '';
				expectInvalid(obj, errorProp, 'number');

				obj.course[key] = 9;
				expectInvalid(obj, errorProp, '>= 10');

				obj.course[key] = 10001;
				expectInvalid(obj, errorProp, '<= 10000');

				obj.course[key] = 95;
				expectValid(obj);

				obj.course[key] = 1500;
				expectValid(obj);

				obj.course[key] = 88.3;
				expectValid(obj);
			});
		}
	});

	describe('course.cutName', function () {
		const cuts = ['1', '2', '3', '4'];
		const errorProp = ['dataPath', ''];
		const validRequest = {...VALID_OBJECT};

		for (const cut of cuts) {
			it(cut, function () {
				const obj = {...validRequest};
				const key = `cut${cut}Name`;
				errorProp[1] = `.course.${key}`;

				obj.course[key] = '';
				expectInvalid(obj, errorProp, 'one of the allowed values');

				obj.course[key] = 'FFF';
				expectInvalid(obj, errorProp, 'one of the allowed values');

				obj.course[key] = 'FF';
				expectInvalid(obj, errorProp, 'one of the allowed values');

				obj.course[key] = 'A+';
				expectValid(obj);

				obj.course[key] = 'C';
				expectValid(obj);

				obj.course[key] = 'D-';
				expectValid(obj);
			});
		}
	});

	it('category invalid props', function () {
		const obj = {...VALID_OBJECT};

		obj.categories[0].id = '';
		expectInvalid(obj, ['keyword', 'additionalProperties'], 'NOT have additional properties');
		delete obj.categories[0].id;

		delete obj.categories[0].dropped;
		expectInvalid(obj, ['keyword', 'minProperties'], 'NOT have fewer than 5 properties');
		obj.categories[0].dropped = null;
	});

	it('name', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '.categories[1].name'];

		expectValid(obj);

		obj.categories[1].name = '';
		expectInvalid(obj, errorProp, 'shorter');

		obj.categories[1].name = 14;
		expectInvalid(obj, errorProp, 'string');

		obj.categories[1].name = null;
		expectValid(obj);
	});

	it('weight', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '.categories[0].weight'];

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
		const errorProp = ['dataPath', '.categories[1].position'];

		obj.categories[1].position = null;
		expectValid(obj);

		obj.categories[1].position = false;
		expectInvalid(obj, errorProp, 'should be integer');

		obj.categories[1].position = 0;
		expectValid(obj);
	});

	it('numGrades', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '.categories[1].numGrades'];

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
		const errorProp = ['dataPath', '.categories[1].dropped'];

		obj.categories[1].dropped = null;
		expectValid(obj);

		obj.categories[1].dropped = false;
		expectInvalid(obj, errorProp, 'should be integer');

		obj.categories[1].dropped = 0;
		expectInvalid(obj, errorProp, 'should be >= 1');

		obj.categories[1].dropped = 1;
		expectValid(obj);
	});
});
