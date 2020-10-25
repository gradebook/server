// @ts-check
module.exports = function serializeUser(modelResponse) {
	delete modelResponse.id;
	delete modelResponse.gid;
	delete modelResponse.totalSchoolChanges;

	return modelResponse;
};
