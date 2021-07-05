// @ts-check

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 */
module.exports = function slowDownResponse(request, response, next) {
	const {delay} = request.query;
	delete request.query.delay;
	const numericDelay = Number(delay);
	if (!numericDelay || Number.isNaN(delay)) {
		return next();
	}

	if (numericDelay > 600) {
		next(new Error('Max delay is 10 minutes'));
	}

	setTimeout(next, numericDelay * 1000, undefined);
};
