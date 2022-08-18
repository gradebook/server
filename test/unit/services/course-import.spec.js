// @ts-check
import sinon from 'sinon';
import {expect} from 'chai';
import * as courseImportService from '../../../lib/services/course-import.js';

const SLUG_TEST_CASE = JSON.stringify({
	m: '1|2022|3|4|A,450|B,400|C,350|D,300|ACCT 328',
	z: ['0|0|1|100|Exam 1', '0|0|1|100|Exam 2', '0|0|1|100|Exam 3', '0|0|1|100|Final', '1|0|5|100|Quizzes'],
});

const SLUG_ASSERTION = {
	course: {
		semester: '2019S',
		name: 'ACCT 328',
		credits: 3,
		cutoffs: '{"A":450,"B":400,"C":350,"D":300}',
	},
	categories: [
		{
			name: 'Exam 1',
			weight: 100,
			position: 100,
			dropped: 0,
			numGrades: 1,
		},
		{
			name: 'Exam 2',
			weight: 100,
			position: 200,
			dropped: 0,
			numGrades: 1,
		},
		{
			name: 'Exam 3',
			weight: 100,
			position: 300,
			dropped: 0,
			numGrades: 1,
		},
		{
			name: 'Final',
			weight: 100,
			position: 400,
			dropped: 0,
			numGrades: 1,
		},
		{
			name: 'Quizzes',
			weight: 100,
			position: 500,
			dropped: 0,
			numGrades: 5,
		},
	],
};

const HASH_TEST_CASE = 'ewAiAG0AIgA6ACIAMQB8ADIAMAAyADIAfAAxAHwANAB8AEEALAA5ADAAfABCACwAOAAwAHwAQwAsAD'
+ 'cAMAB8AEQALAAzADAAfABQAEgAQQBSACAANQAxADUAIgAsACIAegAiADoAWwAiADEAfAAwAHwANgB8ADIANQB8AFAAbwBpAG4Ad'
+ 'AAgAG8AZgAgAEMAYQByAGUAIABUAGUAcwB0AGkAbgBnACAATABhAGIAIABTAGsAaQBsAGwAcwAvAFAAYQByAHQAaQBjAGkAcABh'
+ 'AHQAaQBvAG4AIgAsACIAMAB8ADAAfAAxAHwAMgA1AHwAUABvAGkAbgB0ACAAbwBmACAAQwBhAHIAZQAgAFQAZQBzAHQAaQBuAGc'
+ 'AIABDAGUAcgB0AGkAZgBpAGMAYQB0AGkAbwBuACAAKABNAGkAZAB0AGUAcgBtACkAIgAsACIAMQB8ADAAfAA2AHwAMgAwAHwATA'
+ 'BhAGIAIABXAG8AcgBrAHMAaABlAGUAdABzACAANwAtADEAMgAiACwAIgAwAHwAMAB8ADEAfAAzADAAfABGAGkAbgBhAGwAIgBdAH0A';

const HASH_ASSERTION = {
	course: {
		semester: '2019S',
		name: 'PHAR 515',
		credits: 1,
		cutoffs: '{"A":90,"B":80,"C":70,"D":30}',
	},
	categories: [
		{
			name: 'Point of Care Testing Lab Skills/Participation',
			weight: 25,
			position: 100,
			dropped: 0,
			numGrades: 6,
		},
		{
			name: 'Point of Care Testing Certification (Midterm)',
			weight: 25,
			position: 200,
			dropped: 0,
			numGrades: 1,
		},
		{
			name: 'Lab Worksheets 7-12',
			weight: 20,
			position: 300,
			dropped: 0,
			numGrades: 6,
		},
		{
			name: 'Final',
			weight: 30,
			position: 400,
			dropped: 0,
			numGrades: 1,
		},
	],
};

describe('Unit > Services > Course Import', function () {
	it('By hash', async function () {
		expect(await courseImportService.importFromHash(HASH_TEST_CASE)).to.deep.equal(HASH_ASSERTION);
		expect(await courseImportService.importFromHash(('this is not base64'))).to.equal(null);
	});

	it('By slug', async function () {
		const GOOD_SLUG = 'aggie-MATH-151-824e3';
		const BAD_SLUG = 'notaslug';

		const shrink = sinon.stub();

		shrink.withArgs(GOOD_SLUG).resolves(SLUG_TEST_CASE);
		expect(await courseImportService.importFromSlug(GOOD_SLUG, shrink)).to.deep.equal(SLUG_ASSERTION);
		expect(await courseImportService.importFromSlug(BAD_SLUG)).to.equal(null);
	});
});
