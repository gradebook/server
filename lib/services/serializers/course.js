// @ts-check
export function serializeCourse(modelResponse) {
	delete modelResponse.user;
	return modelResponse;
}
