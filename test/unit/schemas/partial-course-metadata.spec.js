const schemaValidator = require('../../utils/schema-validator');
const schema = require('../../../lib/services/validation/schemas/partial-course-meta.json');

const {expectInvalid, expectValid} = schemaValidator(schema);
const VALID_OBJECT = {
	name: 'ECEN 482',
	semester: '2019S',
	cutoffs: '{"A":90,"B":80,"C":70,"D":60}',
	credits: 3,
};

describe('Unit > Schemas > CourseMetadata', function () {
	it('invalid props', function () {
		expectInvalid({}, ['keyword', 'required'], 'name');
		expectInvalid({id: ''}, ['keyword', 'required'], 'must have required property');
		expectInvalid({...VALID_OBJECT, id: ''}, ['keyword', 'additionalProperties'], 'NOT have additional properties');
	});

	it('name', function () {
		const object = {...VALID_OBJECT};
		const errorProp = ['instancePath', '/name'];

		object.name = '';
		expectInvalid(object, errorProp, 'must match pattern');

		object.name = 14;
		expectInvalid(object, errorProp, 'string');

		object.name = null;
		expectInvalid(object, errorProp, 'string');

		object.name = 'Introduction to Gradebook';
		expectInvalid(object, errorProp, 'must match pattern');

		object.name = 'ECEN 482';
		expectValid(object);
	});

	it('semester', function () {
		const object = {...VALID_OBJECT, semester: 'Fall 2019'};
		const errorProp = ['instancePath', '/semester'];

		expectInvalid(object, errorProp, 'must match pattern');

		object.semester = '2019T';
		expectInvalid(object, errorProp, 'must match pattern');

		object.semester = '2019F';
		expectValid(object);
	});
});
