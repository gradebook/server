module.exports = function sanitizeCourse(modelResponse) {
	delete modelResponse.user_id;
	delete modelResponse.credit_hours;

	return modelResponse;
};
