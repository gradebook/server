// @ts-check
module.exports = function serializeCourse(modelResponse) {
	delete modelResponse.user;
	return modelResponse;
};
