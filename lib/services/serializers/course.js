// @ts-check
module.exports = function serializeCourse(modelResponse) {
	delete modelResponse.user_id;
	delete modelResponse.user;
	// @todo(4.0) clean this up

	return modelResponse;
};
