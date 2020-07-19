const serializeGrade = require('./grade');

module.exports = function sanitizeCategory(modelResponse) {
	modelResponse.dropped = modelResponse.dropped_grades;
	// @todo(4.0) delete modelResponse.dropped_grades;

	if ('grades' in modelResponse) {
		for (const grade of modelResponse.grades) {
			serializeGrade(grade);
		}
	}

	return modelResponse;
};
