// @ts-check
import {createSchemaValidator} from '../../utils/schema-validator.js';

const {expectInvalid, expectValid} = createSchemaValidator('user.settings.$$gpa');

/** @type {Record<string, any>} */
const VALID_OBJECT = {
	overallCredits: 45,
	gpaSemester: '2019S',
	overallGpa: 3.5,
};

describe('Unit > Schemas > UserGpaSettings', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'overallGpa');
		expectInvalid({semester: '0000D'}, ['keyword', 'required'], 'must have required property');
		expectInvalid({...VALID_OBJECT, id: ''}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('overallCredits', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/overallCredits'];

		object.overallCredits = 1000;
		expectInvalid(object, errorProp, 'must be < 1000');

		object.overallCredits = -1;
		expectInvalid(object, errorProp, 'must be >= 0');

		object.overallCredits = 15.3;
		expectInvalid(object, errorProp, 'integer');

		object.overallCredits = null;
		expectInvalid(object, errorProp, 'integer');

		object.overallCredits = 'Introduction to Gradebook';
		expectInvalid(object, errorProp, 'integer');

		object.overallCredits = 45;
		expectValid(object);
	});

	it('overallGpa', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/overallGpa'];

		object.overallGpa = -0.01;
		expectInvalid(object, errorProp, '>= 0');

		object.overallGpa = 5.01;
		expectInvalid(object, errorProp, '<= 5');

		object.overallGpa = null;
		expectInvalid(object, errorProp, 'number');

		object.overallGpa = 'A string';
		expectInvalid(object, errorProp, 'number');

		object.overallGpa = 3.6;
		expectValid(object);
	});

	it('gpaSemester', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/gpaSemester'];

		object.gpaSemester = 3;
		expectInvalid(object, errorProp, 'string');

		object.gpaSemester = null;
		expectInvalid(object, errorProp, 'string');

		object.gpaSemester = 'Patter mismatch';
		expectInvalid(object, errorProp, 'pattern');

		object.gpaSemester = '2022D';
		expectInvalid(object, errorProp, 'pattern');

		// Intentionally invalid semester code
		object.gpaSemester = '2022F';
		expectValid(object);
	});
});
