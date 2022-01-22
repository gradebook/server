// @ts-check
import ObjectId from 'bson-objectid';
import {createSchemaValidator} from '../../utils/schema-validator.js';

const {expectInvalid, expectValid} = createSchemaValidator('grades.batch');

describe('Unit > Schemas > BatchEditGrades', function () {
	it('Bad all around', function () {
		expectInvalid({}, ['keyword', 'minProperties'], 'NOT have fewer than 1 items');
		expectInvalid({
			create: [],
			update: [],
		}, ['keyword', 'minItems'], 'NOT have fewer than 1 items');

		expectInvalid({
			delete: [],
		}, ['keyword', 'minItems'], 'NOT have fewer than 1 items');

		expectInvalid({
			update: [],
		}, ['keyword', 'minItems'], 'NOT have fewer than 1 items');

		expectInvalid({
			create: [],
		}, ['keyword', 'minItems'], 'NOT have fewer than 1 items');
	});

	it('Only create', function () {
		expectValid({
			create: [{
				name: 'Homework 1',
				grade: 95,
			}, {
				name: 'Homework 2',
				grade: null,
			}, {
				name: 'Homework 3',
			}],
		});

		expectInvalid({
			create: {
				name: 'test',
			},
		}, ['keyword', 'type'], 'must be array');

		expectInvalid({
			create: [{
				id: {
					test: new ObjectId().toHexString(),
				},
			}],
		}, ['instancePath', '/create/0'], 'NOT have additional properties');

		expectInvalid({
			create: [{
				category_id: new ObjectId().toHexString(), // eslint-disable-line camelcase
			}],
		}, ['instancePath', '/create/0'], 'NOT have additional properties');
	});

	it('Only update', function () {
		expectValid({
			update: [{
				id: new ObjectId().toHexString(),
				name: 'Homework 1',
				grade: 100,
			}, {
				id: new ObjectId().toHexString(),
				grade: 85,
			}, {
				id: new ObjectId().toHexString(),
				grade: null,
			}],
		});
	});

	it('Only delete', function () {
		expectValid({
			delete: [new ObjectId().toHexString(), new ObjectId().toHexString(), new ObjectId().toHexString()],
		});

		const duplicateId = new ObjectId().toHexString();
		expectInvalid({
			delete: [duplicateId, duplicateId],
		}, ['instancePath', '/delete'], 'NOT have duplicate items');

		expectInvalid({
			delete: new ObjectId().toHexString(),
		}, ['instancePath', '/delete'], 'must be array');
	});

	it('No create AND delete', function () {
		expectInvalid({
			delete: [new ObjectId().toHexString()],
			create: [{
				name: 'Homework 1',
				grade: 95,
			}, {
				name: 'Homework 2',
				grade: null,
			}, {
				name: 'Homework 3',
			}],
		}, ['schemaPath', '#/dependencies/delete/not'], 'NOT be valid');
	});
});
