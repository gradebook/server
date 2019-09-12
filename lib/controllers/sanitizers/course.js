module.exports = function sanitizeCourse(modelResponse) {
	delete modelResponse.user_id;

	return modelResponse;
};
