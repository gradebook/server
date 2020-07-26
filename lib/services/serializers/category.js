// @ts-check
const serializeGrade = require('./grade');

module.exports = function serializeCategory(modelResponse) {
	// @todo(4.1) remove
	if ('dropped' in modelResponse) {
		modelResponse.dropped_grades = modelResponse.dropped; // eslint-disable-line camelcase
	}

	// @todo(4.1) remove
	if ('course' in modelResponse) {
		modelResponse.course_id = modelResponse.course; // eslint-disable-line camelcase
	}

	if ('grades' in modelResponse) {
		for (const grade of modelResponse.grades) {
			serializeGrade(grade);
		}
	}

	return modelResponse;
};
