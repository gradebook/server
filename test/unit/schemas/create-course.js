const schemaValidator = require('../../utils/schema-validator');
const cutSchema = require('../../../lib/services/validation/schemas/course-cut.json');
const schema = require('../../../lib/services/validation/schemas/create-course.json');

describe('Unit > Schemas > CreateCourse', function () {
	const {expectInvalid, expectValid} = schemaValidator(schema, [cutSchema]);
	const VALID_OBJECT = {name: 'ECEN 482', cut1: 90, cut2: 80, cut3: 70, cut3: 60};

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
		const cuts = ['A', 'B', 'C', 'D'];
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
});
