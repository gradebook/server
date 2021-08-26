module.exports = fn => {
	if (typeof fn !== 'function') {
		throw new TypeError(`fn must be a function, received ${typeof fn}`);
	}

	return async function forwardRequest(request, response, next) {
		try {
			await fn(request, response);
		} catch (error) {
			next(error);
		}
	};
};
