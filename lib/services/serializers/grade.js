// @ts-check
module.exports = function serializeGrade(modelResponse) {
	// @todo(4.1) camelcase
	if ('course' in modelResponse) {
		modelResponse.course_id = modelResponse.course; // eslint-disable-line camelcase
	}

	// @todo(4.1) camelcase
	if ('category' in modelResponse) {
		modelResponse.category_id = modelResponse.category; // eslint-disable-line camelcase
	}

	// @todo(4.1) camelcase
	delete modelResponse.user;
	delete modelResponse.user_id;

	return modelResponse;
};
