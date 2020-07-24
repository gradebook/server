module.exports = function sanitizeCourse(modelResponse) {
	delete modelResponse.user_id;
	delete modelResponse.user;
	// @todo(4.0) clean this up

	return modelResponse;
};
