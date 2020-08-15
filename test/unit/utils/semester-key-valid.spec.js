const valid = require('../../../lib/utils/semester-key-valid');

describe('Unit > SemesterKeyValid', function () {
	it('valid semesters', function () {
		expect(valid('2019F')).to.be.true;
		expect(valid('2019S')).to.be.true;
		expect(valid('2019U')).to.be.true;
		expect(valid('2019W')).to.be.true;
		expect(valid('1000F')).to.be.true;
		expect(valid('1000S')).to.be.true;
		expect(valid('1000U')).to.be.true;
		expect(valid('1000W')).to.be.true;
		expect(valid('3000F')).to.be.true;
		expect(valid('3000S')).to.be.true;
		expect(valid('3000U')).to.be.true;
		expect(valid('3000W')).to.be.true;
	});

	it('invalid semesters', function () {
		expect(valid('2019 Fall')).to.be.false;
		expect(valid('2019 Spring')).to.be.false;
		expect(valid('2019 Summer')).to.be.false;
		expect(valid('2019 Winter')).to.be.false;
		expect(valid('Fall 1000')).to.be.false;
		expect(valid('Spring 1000')).to.be.false;
		expect(valid('Summer 1000')).to.be.false;
		expect(valid('Winter 1000')).to.be.false;
	});
});
