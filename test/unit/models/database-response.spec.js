// @ts-check
import {expect} from 'chai';
import {CourseRow} from '../../../lib/models/course.js';
import {
	enableQueryTracking, removeQueryTracking, recallQueries, interceptQuery,
} from '../../utils/mocked-knex.js';

describe('Unit > Models > DatabaseResponse', function () {
	/** @type {import('../../../lib/models/database-response').AbstractDatabaseResponse} */
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

		expect(instance.diff, 'Diff contains same data as internal diff').to.deep.equal(instance._diff);
		expect(instance.diff, 'Diff copies internal diff').to.not.equal(instance._diff);
		expect(instance._diff, 'Internal diff stores unsnaked').to.deep.equal({
			credits: 'credit_hours__',
		});

		expect(instance._getChangeSet(), 'Changeset transforms to snaked').to.deep.equal({
			credit_hours: 'credit_hours__', // eslint-disable-line camelcase
		});
	});

	describe('commit', function () {
		beforeEach(enableQueryTracking);

		afterEach(removeQueryTracking);

		it('short-circuits when there are no changes', async function () {
			const response = await instance.commit(null, null);
			expect(response).to.be.empty;
			expect(recallQueries()).to.be.empty;
		});

		it('correctly transforms from/to snake case', async function () {
			instance.set('credit_hours', 'credit_hours__');
			instance.set('name', 'name__');

			interceptQuery(query => {
				expect(query.sql).to.equal('update `courses` set `name` = ?, `credit_hours` = ? where `id` = ?');
				return ({
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

			const response = await instance.commit(null, null);
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
