module.exports = function sanitizeCourse(modelResponse) {
	modelResponse.credits = modelResponse.credit_hours;
	delete modelResponse.user_id;
	delete modelResponse.credit_hours;

	return modelResponse;
};
