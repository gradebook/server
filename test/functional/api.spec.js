// @ts-check
import {expect} from 'chai';
import * as api from '../../lib/api/index.js';
import {serializeUserExport as exportSerializer} from '../../lib/services/serializers/export-data.js';
import {getUserExport as getGoldenExport} from '../fixtures/functional-user-export.js';
import {prepareExport} from '../utils/prepare-export.js';
import * as testConfig from '../utils/test-config.js';
import config from '../../lib/config.js';
import {knex} from '../../lib/database/index.js';

const DEFAULT_CUTOFFS = JSON.stringify([{
	name: 'A',
	cutoff: 90,
}, {
	name: 'B',
	cutoff: 80,
}, {
	name: 'C',
	cutoff: 70,
}, {
	name: 'D',
	cutoff: 60,
}]);

const db = testConfig.TEST_DATABASE;

/**
 * @param {import('knex').Knex.Transaction} txn
 */
async function seed(txn) {
	const user = await api.user.create({
		data: {gid: 10_000_000_000_001, firstName: 'Integration', email: 'integration@gbdev.cf'},
		db,
		txn,
	});

	// #region Create first course
	const firstCourse = await api.course.create({
		user: user.id,
		course: {
			name: 'FIRST 101',
			semester: '2000F',
			credits: 4,
			cutoffs: DEFAULT_CUTOFFS,
		},
		categories: [{
			name: 'Homework',
			weight: 15,
			position: 100,
			numGrades: 14,
			dropped: null,
		}, {
			name: 'Lab',
			weight: 50,
			position: 200,
			numGrades: 10,
			dropped: 1,
		}, {
			name: 'Exam 1',
			weight: 10,
			position: 300,
			numGrades: 1,
			dropped: null,
		}, {
			name: 'Final',
			weight: 25,
			position: 400,
			numGrades: 1,
			dropped: null,
		}],
	}, db, txn);
	// #endregion

	// #region Create second course
	const secondCourse = await api.course.create({
		user: user.id,
		course: {
			name: 'WORK 110',
			semester: '2000W',
			credits: 4,
			cutoffs: DEFAULT_CUTOFFS,
		},
		categories: [{
			name: 'Homework',
			weight: 15,
			position: 100,
			numGrades: 14,
			dropped: null,
		}, {
			name: 'Quizzes',
			weight: 15,
			position: 200,
			numGrades: 10,
			dropped: 3,
		}, {
			name: 'Exam 1',
			weight: 10,
			position: 300,
			numGrades: 1,
			dropped: null,
		}, {
			name: 'Exam 2',
			weight: 20,
			position: 400,
			numGrades: 1,
			dropped: null,
		}, {
			name: 'Final',
			weight: 40,
			position: 500,
			numGrades: 1,
			dropped: null,
		}],
	}, db, txn);
	// #endregion

	return {user, firstCourse, secondCourse};
}

async function getExport(user, txn) {
	const export_ = await api.user.export(user.id, db, txn);
	export_.user = {...user};
	exportSerializer(export_);

	export_.user.created = '__created__';
	export_.user.updated = '__updated__';

	return export_;
}

describe('Functional > API E2E', function () {
	before(async function () {
		const {ignoredUsers} = await import('../../lib/services/ignored-users.js');
		await ignoredUsers.init(config, knex);
		ignoredUsers._users.set(db, new Set());
	});

	it('Browse, Create, Delete', async function () {
		const txn = await api.getTransaction();
		try {
			const {user, firstCourse, secondCourse} = await seed(txn);

			// #region Create and delete grade
			const testGrade = await api.grade.create({
				db,
				txn,
				data: {
					user: user.id,
					category: firstCourse.categories[0].id,
					course: firstCourse.course.id,
					grade: 92,
				},
			});

			expect(await api.grade.delete({id: testGrade.id, db, txn})).to.be.ok;
			// #endregion

			// #region Create and delete category
			const testCategory = await api.category.create({
				data: {
					user: user.id,
					course: firstCourse.course.id,
					name: 'Quizzes',
					weight: 100,
					dropped: 3,
					position: 900,
					grades: [{
						name: 'Quiz 1',
						grade: null,
					}, {
						name: 'Quiz 2',
						grade: null,
					}],
				},
				db,
				txn,
			});

			expect(await api.category.delete(testCategory.id, user.id, db, txn)).to.be.ok;
			// #endregion

			// #region Browse objects
			let response = await api.grade.browse({inCourse: [firstCourse.course.id, secondCourse.course.id]}, db, txn);
			expect(response.length).to.equal(53);

			response = await api.grade.browse({category: firstCourse.categories[0].id}, db, txn);
			expect(response.length).to.equal(14);

			response = await api.category.browse({course: firstCourse.course.id}, db, txn);
			expect(response.length).to.equal(4);

			response = await api.category.browse({user: user.id}, db, txn);
			expect(response.length).to.equal(9);

			response = await api.course.browse({semester: '2000F'}, db, txn);
			expect(response.length).to.equal(1);

			response = await api.course.browse({user: user.id}, db, txn);
			expect(response.length).to.equal(2);
			// #endregion
		} finally {
			await txn.rollback();
		}
	});

	it('Export', async function () {
		const txn = await api.getTransaction();
		try {
			const {user} = await seed(txn);
			expect(prepareExport(await getExport(user, txn))).to.deep.equal(prepareExport(getGoldenExport()));
		} finally {
			await txn.rollback();
		}
	});
});
