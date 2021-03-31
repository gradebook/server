const objectId = require('bson-objectid');
const schemaValidator = require('../../utils/schema-validator');
const objSchema = require('../../../lib/services/validation/schemas/object-id.json');
const schema = require('../../../lib/services/validation/schemas/batch-edit.json');

const {expectInvalid, expectValid} = schemaValidator(schema, [objSchema]);

describe('Unit > Schemas > BatchEditGrades', function () {
	it('Bad all around', function () {
		expectInvalid({}, ['keyword', 'minProperties'], 'NOT have fewer than 1 items');
		expectInvalid({
			create: [],
			update: []
		}, ['keyword', 'minItems'], 'NOT have fewer than 1 items');

		expectInvalid({
			delete: []
		}, ['keyword', 'minItems'], 'NOT have fewer than 1 items');

		expectInvalid({
			update: []
		}, ['keyword', 'minItems'], 'NOT have fewer than 1 items');

		expectInvalid({
			create: []
		}, ['keyword', 'minItems'], 'NOT have fewer than 1 items');
	});

	it('Only create', function () {
		expectValid({
			create: [{
				name: 'Homework 1',
				grade: 95
			}, {
				name: 'Homework 2',
				grade: null
			}, {
				name: 'Homework 3'
			}]
		});

		expectInvalid({
			create: {
				name: 'test'
			}
		}, ['keyword', 'type'], 'must be array');

		expectInvalid({
			create: [{
				id: {
					test: objectId().toString()
				}
			}]
		}, ['instancePath', '/create/0'], 'NOT have additional properties');

		expectInvalid({
			create: [{
				category_id: objectId().toString() // eslint-disable-line camelcase
			}]
		}, ['instancePath', '/create/0'], 'NOT have additional properties');
	});

	it('Only update', function () {
		expectValid({
			update: [{
				id: objectId().toString(),
				name: 'Homework 1',
				grade: 100
			}, {
				id: objectId().toString(),
				grade: 85
			}, {
				id: objectId().toString(),
				grade: null
			}]
		});
	});

	it('Only delete', function () {
		expectValid({
			delete: [objectId().toString(), objectId().toString(), objectId().toString()]
		});

		const duplicateId = objectId().toString();
		expectInvalid({
			delete: [duplicateId, duplicateId]
		}, ['instancePath', '/delete'], 'NOT have duplicate items');

		expectInvalid({
			delete: objectId().toString()
		}, ['instancePath', '/delete'], 'must be array');
	});

	it('No create AND delete', function () {
		expectInvalid({
			delete: [objectId().toString()],
			create: [{
				name: 'Homework 1',
				grade: 95
			}, {
				name: 'Homework 2',
				grade: null
			}, {
				name: 'Homework 3'
			}]
		}, ['schemaPath', '#/dependencies/delete/not'], 'NOT be valid');
	});
});
