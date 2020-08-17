// @ts-check
module.exports = function serializeUser(modelResponse) {
	delete modelResponse.id;
	delete modelResponse.gid;

	return modelResponse;
};
