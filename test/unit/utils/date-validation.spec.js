const validate = require('../../../lib/utils/date-validations');

describe('Unit > Utils > DateValidations', function () {
	it('isValidYear', function () {
		expect(validate.isValidYear({})).to.be.false;
		expect(validate.isValidYear('not')).to.be.false;
		expect(validate.isValidYear(500_000)).to.be.false;
		expect(validate.isValidYear(10)).to.be.false;
		expect(validate.isValidYear(2015)).to.be.true;
	});

	it('isValidMonth', function () {
		expect(validate.isValidMonth({})).to.be.false;
		expect(validate.isValidMonth('not')).to.be.false;
		expect(validate.isValidMonth(13)).to.be.false;
		expect(validate.isValidMonth(0)).to.be.false;
		expect(validate.isValidMonth(1)).to.be.true;
		expect(validate.isValidMonth(12)).to.be.true;
	});

	it('isValidDay', function () {
		expect(validate.isValidDay({})).to.be.false;
		expect(validate.isValidDay('not')).to.be.false;
		expect(validate.isValidDay(50)).to.be.false;
		expect(validate.isValidDay(0)).to.be.false;
		expect(validate.isValidDay(1)).to.be.true;
		expect(validate.isValidDay(28)).to.be.true;
		expect(validate.isValidDay(30)).to.be.true;
		expect(validate.isValidDay(31)).to.be.true;
	});
});
