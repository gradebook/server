// @ts-check
import {expect} from 'chai';
import {isSemester} from '../../../lib/utils/semester-key-valid.js';

describe('Unit > SemesterKeyValid', function () {
	it('valid semesters', function () {
		expect(isSemester('2019F')).to.be.true;
		expect(isSemester('2019S')).to.be.true;
		expect(isSemester('2019U')).to.be.true;
		expect(isSemester('2019W')).to.be.true;
		expect(isSemester('1000F')).to.be.true;
		expect(isSemester('1000S')).to.be.true;
		expect(isSemester('1000U')).to.be.true;
		expect(isSemester('1000W')).to.be.true;
		expect(isSemester('3000F')).to.be.true;
		expect(isSemester('3000S')).to.be.true;
		expect(isSemester('3000U')).to.be.true;
		expect(isSemester('3000W')).to.be.true;
	});

	it('invalid semesters', function () {
		expect(isSemester('2019 Fall')).to.be.false;
		expect(isSemester('2019 Spring')).to.be.false;
		expect(isSemester('2019 Summer')).to.be.false;
		expect(isSemester('2019 Winter')).to.be.false;
		expect(isSemester('Fall 1000')).to.be.false;
		expect(isSemester('Spring 1000')).to.be.false;
		expect(isSemester('Summer 1000')).to.be.false;
		expect(isSemester('Winter 1000')).to.be.false;
	});
});
