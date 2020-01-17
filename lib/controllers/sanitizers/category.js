module.exports = function sanitizeCategory(modelResponse) {
	delete modelResponse.dropped_grades;

	return modelResponse;
};
