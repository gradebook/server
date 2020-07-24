module.exports = function sanitizeGrade(modelResponse) {
	if ('course' in modelResponse) {
		modelResponse.course_id = modelResponse.course; // eslint-disable-line camelcase
		// @todo(4.0) delete modelResponse.course_id;
	}

	if ('category' in modelResponse) {
		modelResponse.category_id = modelResponse.category; // eslint-disable-line camelcase
		// @todo(4.0) delete modelResponse.category_id;
	}

	if ('user_id' in modelResponse) {
		delete modelResponse.user_id;
	}

	return modelResponse;
};
