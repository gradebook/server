module.exports = function sanitizeCourse(modelResponse) {
	delete modelResponse.user_id;
	delete modelResponse.status;

	return modelResponse;
};
