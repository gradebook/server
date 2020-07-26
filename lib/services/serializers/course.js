// @ts-check
module.exports = function serializeCourse(modelResponse) {
	// @todo(4.1) remove
	if ('credits' in modelResponse) {
		modelResponse.credit_hours = modelResponse.credits; // eslint-disable-line camelcase
	}

	// @todo(4.1) clean up
	delete modelResponse.user_id;
	delete modelResponse.user;

	return modelResponse;
};
