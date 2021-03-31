// @ts-check
const logging = require('../../logging');
const serializeCourse = require('./course');
const serializeCategory = require('./category');

module.exports = function serializeImportedCourse(modelResponse) {
	if (modelResponse.error) {
		logging.error('Unhandled error in create-course:');
		logging.error(modelResponse);
		return;
	}

	serializeCourse(modelResponse.course);

	for (const category of modelResponse.categories) {
		serializeCategory(category);
	}
};
