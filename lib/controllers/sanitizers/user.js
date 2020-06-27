module.exports = function sanitizeUser(modelResponse) {
	delete modelResponse.id;
	delete modelResponse.gid;

	modelResponse.firstName = modelResponse.first_name;
	modelResponse.lastName = modelResponse.last_name;

	return modelResponse;
};
