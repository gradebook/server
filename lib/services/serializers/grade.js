// @ts-check
module.exports = function serializeGrade(modelResponse) {
	delete modelResponse.user;
	return modelResponse;
};
