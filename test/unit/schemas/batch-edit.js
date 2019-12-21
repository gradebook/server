const ObjectId = require('bson-objectid');
const schemaValidator = require('../../utils/schema-validator');
const objSchema = require('../../../lib/services/validation/schemas/object-id.json');
const schema = require('../../../lib/services/validation/schemas/batch-edit.json');

describe('Unit > Schemas > BatchEditGrades', function () {
	const {expectInvalid, expectValid} = schemaValidator(schema, [objSchema]);

	it('Bad all around', function () {
		expectInvalid({}, ['keyword', 'minProperties'], 'NOT have fewer than 1 properties');
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
		}, ['keyword', 'type'], 'should be array');

		expectInvalid({
			create: [{
				id: {
					test: ObjectId.generate()
				}
			}]
		}, ['dataPath', '.create[0]'], 'NOT have additional properties');

		expectInvalid({
			create: [{
				category_id: ObjectId.generate() // eslint-disable-line camelcase
			}]
		}, ['dataPath', '.create[0]'], 'NOT have additional properties');
	});

	it('Only update', function () {
		expectValid({
			update: [{
				id: ObjectId.generate(),
				name: 'Homework 1',
				grade: 100
			}, {
				id: ObjectId.generate(),
				grade: 85
			}, {
				id: ObjectId.generate(),
				grade: null
			}]
		});
	});

	it('Only delete', function () {
		expectValid({
			delete: [ObjectId.generate(), ObjectId.generate(), ObjectId.generate()]
		});

		const duplicateId = ObjectId.generate();
		expectInvalid({
			delete: [duplicateId, duplicateId]
		}, ['dataPath', '.delete'], 'NOT have duplicate items');

		expectInvalid({
			delete: ObjectId.generate()
		}, ['dataPath', '.delete'], 'should be array');
	});

	it('No create AND delete', function () {
		expectInvalid({
			delete: [ObjectId.generate()],
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
