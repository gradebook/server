// @ts-check
const serializeGrade = require('./grade');

module.exports = function serializeCategory(modelResponse) {
	if (Object.hasOwnProperty.call(modelResponse, 'grades')) {
		for (const grade of modelResponse.grades) {
			serializeGrade(grade);
		}
	}

	return modelResponse;
};
