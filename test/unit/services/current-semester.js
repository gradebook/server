const rewire = require('rewire');
const service = rewire('../../../lib/services/current-semester');

const isSpringAllowed = service.__get__('isSpringAllowed');
const isSummerAllowed = service.__get__('isSummerAllowed');
const isFallAllowed = service.__get__('isFallAllowed');
const isWinterAllowed = service.__get__('isWinterAllowed');
const getActiveSemester = service.__get__('_getActiveSemester');

describe('Unit > CurrentSemesterService', function () {
	it('isSpringAllowed', function () {
		expect(isSpringAllowed(12, 31, 2020)).to.equal(null);
		expect(isSpringAllowed(1, 4, 2020)).to.equal(null);
		expect(isSpringAllowed(1, 5, 2020)).to.equal('2020S');
		expect(isSpringAllowed(3, 15, 2020)).to.equal('2020S');
		expect(isSpringAllowed(5, 25, 2020)).to.equal('2020S');
		expect(isSpringAllowed(5, 26, 2020)).to.equal(null);
	});

	it('isSummerAllowed', function () {
		expect(isSummerAllowed(5, 9, 2020)).to.equal(null);
		expect(isSummerAllowed(5, 10, 2020)).to.equal('2020U');
		expect(isSummerAllowed(7, 15, 2020)).to.equal('2020U');
		expect(isSummerAllowed(8, 25, 2020)).to.equal('2020U');
		expect(isSummerAllowed(8, 26, 2020)).to.equal(null);
	});

	it('isFallAllowed', function () {
		expect(isFallAllowed(7, 31, 2020)).to.equal(null);
		expect(isFallAllowed(8, 1, 2020)).to.equal('2020F');
		expect(isFallAllowed(10, 15, 2020)).to.equal('2020F');
		expect(isFallAllowed(12, 28, 2020)).to.equal('2020F');
		expect(isFallAllowed(12, 29, 2020)).to.equal(null);
	});

	it('isWinterAllowed', function () {
		expect(isWinterAllowed(12, 6, 2020)).to.equal(null);
		expect(isWinterAllowed(12, 7, 2020)).to.equal('2020W');
		expect(isWinterAllowed(12, 25, 2020)).to.equal('2020W');
		expect(isWinterAllowed(1, 15, 2021)).to.equal('2020W');
		expect(isWinterAllowed(1, 25, 2021)).to.equal('2020W');
		expect(isWinterAllowed(1, 26, 2021)).to.equal(null);
	});

	it('_getActiveSemester', function () {
		expect(getActiveSemester(1, 1, 2020)).to.equal('2019W');
		expect(getActiveSemester(1, 10, 2020)).to.equal('2019W');
		expect(getActiveSemester(1, 14, 2020)).to.equal('2019W');
		expect(getActiveSemester(1, 15, 2020)).to.equal('2020S');
		expect(getActiveSemester(3, 15, 2020)).to.equal('2020S');
		expect(getActiveSemester(5, 25, 2020)).to.equal('2020S');
		expect(getActiveSemester(5, 26, 2020)).to.equal('2020U');
		expect(getActiveSemester(7, 19, 2020)).to.equal('2020U');
		expect(getActiveSemester(8, 10, 2020)).to.equal('2020U');
		expect(getActiveSemester(8, 11, 2020)).to.equal('2020F');
		expect(getActiveSemester(11, 11, 2020)).to.equal('2020F');
		expect(getActiveSemester(12, 21, 2020)).to.equal('2020F');
		expect(getActiveSemester(12, 31, 2020)).to.equal('2020W');
	});
});
