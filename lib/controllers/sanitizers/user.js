module.exports = function sanitizeUser(modelResponse) {
	delete modelResponse.id;
	delete modelResponse.gid;

	return modelResponse;
};
