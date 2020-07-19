module.exports = function sanitizeCategory(modelResponse) {
	modelResponse.dropped = modelResponse.dropped_grades;
	delete modelResponse.dropped_grades;

	return modelResponse;
};
