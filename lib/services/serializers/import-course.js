const serializeCourse = require('./course');
const serializeCategory = require('./category');

module.exports = function serializeImportedCourse(modelResponse) {
	// @todo(4.0)
	if (modelResponse.error) {
		return;
	}

	serializeCourse(modelResponse.course);

	for (const category of modelResponse.categories) {
		serializeCategory(category);
	}
};
