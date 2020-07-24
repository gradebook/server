const {expect} = require('chai');
const knexMock = require('mock-knex');
const AbstractDatabaseResponse = require('../../../lib/models/database-response');
const knex = require('../../../lib/database/knex').instance;

const table = 'test';
const columns = Object.freeze([
	'id',
	'course_ref',
	'user_id',
	'name'
]);

class DatabaseResponse extends AbstractDatabaseResponse {
	get table() {
		return table;
	}

	get columns() {
		return columns;
	}

	transformToSnakeCase(key) {
		if (key === 'course') {
			return 'course_ref';
		}

		if (key === 'user') {
			return 'user_id';
		}

		return key;
	}

	transformFromSnakeCase(key) {
		if (key === 'course_ref') {
			return 'course';
		}

		if (key === 'user_id') {
			return 'user';
		}

		return key;
	}
}

describe('Unit > Models > DatabaseResponse', function () {
	/** @type {import('../../../lib/models/database-response')} */
	let instance;

	beforeEach(function () {
		instance = new DatabaseResponse({
			id: '__id__',
			course_ref: '__course_ref__', // eslint-disable-line camelcase
			user_id: '__user_id__', // eslint-disable-line camelcase
			name: '__name__'
		});

		instance._validate = () => true;
	});

	it('diff uses unsnaked values', function () {
		instance.set('user', 'user__');

		expect(instance.diff).to.deep.equal({
			user: 'user__'
		});

		expect(instance._diff).to.deep.equal({
			user_id: 'user__' // eslint-disable-line camelcase
		});
	});

	describe('commit', function () {
		let queryTracker;

		before(function () {
			knexMock.mock(knex);
		});

		beforeEach(function () {
			queryTracker = knexMock.getTracker();
			queryTracker.install();
		});

		afterEach(function () {
			queryTracker.uninstall();
		});

		after(function () {
			knexMock.unmock(knex);
		});

		it('short-circuits when there are no changes', async function () {
			const response = await instance.commit();
			expect(response).to.be.empty;
			expect(queryTracker.queries.queries).to.be.empty;
		});

		it('correctly transforms from/to snake case', async function () {
			instance.set('name', 'name__');
			instance.set('user', 'user__');

			queryTracker.once('query', function (query) {
				expect(query.sql).to.equal('update `test` set `name` = ?, `user_id` = ? where `id` = ?');
				query.response({
					name: query.bindings[0],
					user_id: query.bindings[1] // eslint-disable-line camelcase
				});
			});

			const response = await instance.commit();
			expect(response).to.deep.equal({
				name: 'name__',
				user: 'user__'
			});
		});
	});
});
