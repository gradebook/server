const schemaValidator = require('../../utils/schema-validator');
const cutSchema = require('../../../lib/services/validation/schemas/course-cut.json');
const cutNameSchema = require('../../../lib/services/validation/schemas/course-cut-name.json');
const schema = require('../../../lib/services/validation/schemas/create-course.json');

describe('Unit > Schemas > CreateCourse', function () {
	const {expectInvalid, expectValid} = schemaValidator(schema, [cutSchema, cutNameSchema]);
	const VALID_OBJECT = {
		name: 'ECEN 482',
		cut1: 90,
		cut2: 80,
		cut3: 70,
		cut4: 60,
		cut1Name: 'A+',
		cut2Name: 'B',
		cut3Name: 'D-',
		cut4Name: 'C+'
	};

	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'name');
	});

	it('name', function () {
		const obj = {...VALID_OBJECT};
		const errorProp = ['dataPath', '.name'];

		obj.name = '';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.name = 14;
		expectInvalid(obj, errorProp, 'string');

		obj.name = null;
		expectInvalid(obj, errorProp, 'string');

		obj.name = 'Introduction to Gradebook';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.name = 'ECEN 482';
		expectValid(obj);
	});

	it('semester', function () {
		const obj = {...VALID_OBJECT, semester: 'Fall 2019'};
		const errorProp = ['dataPath', '.semester'];

		expectInvalid(obj, errorProp, 'should match pattern');

		obj.semester = '2019T';
		expectInvalid(obj, errorProp, 'should match pattern');

		obj.semester = '2019F';
		expectValid(obj);
	});

	describe('cut', function () {
		const cuts = ['1', '2', '3', '4'];
		const errorProp = ['dataPath', ''];
		const validRequest = {...VALID_OBJECT};

		for (const cut of cuts) {
			it(cut, function () {
				const obj = {...validRequest};
				const key = `cut${cut}`;
				errorProp[1] = `.${key}`;

				obj[key] = '';
				expectInvalid(obj, errorProp, 'number');

				obj[key] = 9;
				expectInvalid(obj, errorProp, '>= 10');

				obj[key] = 10001;
				expectInvalid(obj, errorProp, '<= 10000');

				obj[key] = 95;
				expectValid(obj);

				obj[key] = 1500;
				expectValid(obj);

				obj[key] = 88.3;
				expectValid(obj);
			});
		}
	});

	describe('cutName', function () {
		const cuts = ['1', '2', '3', '4'];
		const errorProp = ['dataPath', ''];
		const validRequest = {...VALID_OBJECT};

		for (const cut of cuts) {
			it(cut, function () {
				const obj = {...validRequest};
				const key = `cut${cut}Name`;
				errorProp[1] = `.${key}`;

				obj[key] = '';
				expectInvalid(obj, errorProp, 'one of the allowed values');

				obj[key] = 'FFF';
				expectInvalid(obj, errorProp, 'one of the allowed values');

				obj[key] = 'FF';
				expectInvalid(obj, errorProp, 'one of the allowed values');

				obj[key] = 'A+';
				expectValid(obj);

				obj[key] = 'C';
				expectValid(obj);

				obj[key] = 'D-';
				expectValid(obj);
			});
		}
	});
});
