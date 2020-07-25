// @ts-check
module.exports = function serializeCourse(modelResponse) {
	if ('credits' in modelResponse) {
		modelResponse.credit_hours = modelResponse.credits; // eslint-disable-line camelcase
	}

	delete modelResponse.dropped_grades;
	delete modelResponse.user_id;
	delete modelResponse.user;
	// @todo(4.1) clean this up

	return modelResponse;
};
