module.exports = function sanitizeCourse(modelResponse) {
	modelResponse.creditHours = modelResponse.credit_hours;
	delete modelResponse.credit_hours;

	delete modelResponse.user_id;

	return modelResponse;
};
