const {inherits} = require('util');
const {
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
	NoPermissionError,
	ValidationError,
	TooManyRequestsError,
} = require('ghost-ignition').errors;
const BaseError = require('./base');

inherits(NotFoundError, BaseError);
inherits(BadRequestError, BaseError);
inherits(UnauthorizedError, BaseError);
inherits(NoPermissionError, BaseError);
inherits(ValidationError, BaseError);
inherits(TooManyRequestsError, BaseError);

class InternalServerError extends BaseError {
	constructor(options) {
		super(Object.assign({
			statusCode: 500,
			level: 'critical',
			errorType: 'InternalServerError',
			message: 'There was an error processing your request. Please contact support for more information',
		}, options));
	}
}

class ConsistencyError extends BaseError {
	constructor(options) {
		super(Object.assign({
			statusCode: 409,
			errorType: 'ConsistencyError',
			message: 'Something went wrong. Please contact support for more information',
		}, options));
	}
}

module.exports = {
	BaseError: require('./base'),
	InternalServerError,
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
	NoPermissionError,
	ValidationError,
	TooManyRequestsError,
	ConsistencyError,
};
