// @ts-check
module.exports = function serializeGrade(modelResponse) {
	if ('course' in modelResponse) {
		modelResponse.course_id = modelResponse.course; // eslint-disable-line camelcase
		// @todo(4.1) remove
	}

	if ('category' in modelResponse) {
		modelResponse.category_id = modelResponse.category; // eslint-disable-line camelcase
		// @todo(4.1) remove
	}

	delete modelResponse.user;
	delete modelResponse.user_id;
	// @todo(4.1) remove

	return modelResponse;
};
