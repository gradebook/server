// @ts-check
const logging = require('../../logging');
const serializeCourse = require('./course');
const serializeCategory = require('./category');

module.exports = function serializeNewCourse(modelResponse) {
	if (modelResponse.error) {
		logging.error('Unhandled error in create-course:');
		logging.error(modelResponse);
		return;
	}

	// CASE: completeCreatingCourse - no course data is sent so course could be undefined
	if (modelResponse.course) {
		serializeCourse(modelResponse.course);
	}

	for (const category of modelResponse.categories) {
		serializeCategory(category);
	}
};
