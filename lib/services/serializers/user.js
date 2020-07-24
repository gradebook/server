// @ts-check
module.exports = function serializeUser(modelResponse) {
	delete modelResponse.id;
	delete modelResponse.gid;

	modelResponse.firstName = modelResponse.first_name;
	modelResponse.lastName = modelResponse.last_name;

	return modelResponse;
};
