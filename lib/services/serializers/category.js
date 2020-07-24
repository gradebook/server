// @ts-check
const serializeGrade = require('./grade');

module.exports = function serializeCategory(modelResponse) {
	if ('grades' in modelResponse) {
		for (const grade of modelResponse.grades) {
			serializeGrade(grade);
		}
	}

	return modelResponse;
};
