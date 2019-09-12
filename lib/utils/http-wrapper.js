module.exports = fn => {
	if (typeof fn !== 'function') {
		throw new TypeError(`fn must be a function, received ${typeof fn}`);
	}

	return async function forwardRequest(req, res, next) {
		try {
			await fn(req, res);
		} catch (error) {
			next(error);
		}
	};
};
