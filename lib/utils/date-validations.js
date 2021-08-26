module.exports = {
	isValidYear: year => year >= 2000 && year <= 3000,
	isValidMonth: month => month >= 1 && month <= 12,
	isValidDay: day => day >= 1 && day <= 31,
};
