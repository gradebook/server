// @ts-check
export function serializeGrade(modelResponse) {
	delete modelResponse.user;
	return modelResponse;
}
