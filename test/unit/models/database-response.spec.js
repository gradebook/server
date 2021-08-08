const {expect} = require('chai');
const knexMock = require('mock-knex');
const CourseRow = require('../../../lib/models/course').response;
const knex = require('../../../lib/database/knex').instance;

describe('Unit > Models > DatabaseResponse', function () {
	/** @type {import('../../../lib/models/database-response')} */
	let instance;

	beforeEach(function () {
		instance = new CourseRow({
			id: '__id__',
			credit_hours: '__credit_hours__', // eslint-disable-line camelcase
			user_id: '__user_id__', // eslint-disable-line camelcase
			name: '__name__',
		});

		instance._validate = () => true;
	});

	it('diff uses unsnaked values, but changeset uses snaked values', function () {
		instance.set('credit_hours', 'credit_hours__');

		expect(instance.diff, 'Diff contains same data as internall diff').to.deep.equal(instance._diff);
		expect(instance.diff, 'Diff copies internal diff').to.not.equal(instance._diff);
		expect(instance._diff, 'Internal diff stores unsnaked').to.deep.equal({
			credits: 'credit_hours__',
		});

		expect(instance._getChangeSet(), 'Changeset transforms to snaked').to.deep.equal({
			credit_hours: 'credit_hours__', // eslint-disable-line camelcase
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
			instance.set('credit_hours', 'credit_hours__');
			instance.set('name', 'name__');

			queryTracker.once('query', function (query) {
				expect(query.sql).to.equal('update `courses` set `name` = ?, `credit_hours` = ? where `id` = ?');
				query.response({
					name: query.bindings[0],
					credit_hours: query.bindings[1], // eslint-disable-line camelcase
				});
			});

			expect(instance.json).to.deep.equal({
				id: '__id__',
				credits: 'credit_hours__',
				user: '__user_id__',
				name: 'name__',
			});

			const response = await instance.commit();
			expect(response).to.deep.equal({
				credits: 'credit_hours__',
				name: 'name__',
			});
			expect(instance._originalObject).to.deep.equal({
				id: '__id__',
				credits: 'credit_hours__',
				user: '__user_id__',
				name: 'name__',
			});
		});
	});
});
