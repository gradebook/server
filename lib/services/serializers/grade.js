module.exports = function sanitizeGrade(modelResponse) {
	if ('course_id' in modelResponse) {
		modelResponse.course = modelResponse.course_id;
		delete modelResponse.course_id;
	}

	if ('category_id' in modelResponse) {
		modelResponse.category = modelResponse.category_id;
		delete modelResponse.category_id;
	}

	if ('user_id' in modelResponse) {
		delete modelResponse.user_id;
	}

	return modelResponse;
};
