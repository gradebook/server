module.exports = function sanitizeGrade(modelResponse) {
	if ('course_id' in modelResponse) {
		modelResponse.course = modelResponse.course_id;
		// @todo(4.0) delete modelResponse.course_id;
	}

	if ('category_id' in modelResponse) {
		modelResponse.category = modelResponse.category_id;
		// @todo(4.0) delete modelResponse.category_id;
	}

	if ('user_id' in modelResponse) {
		// @todo(4.0) delete modelResponse.user_id;
	}

	return modelResponse;
};
