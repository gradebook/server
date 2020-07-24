const serializeGrade = require('./grade');

module.exports = function sanitizeCategory(modelResponse) {
	if ('grades' in modelResponse) {
		for (const grade of modelResponse.grades) {
			serializeGrade(grade);
		}
	}

	return modelResponse;
};
