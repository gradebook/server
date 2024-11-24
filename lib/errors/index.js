// @ts-check
import {inherits} from 'util';
import coreErrors from 'ghost-ignition/lib/errors/index.js';
import {BaseError} from './base.js';

const {
	NotFoundError: NotFoundErrorRaw,
	BadRequestError: BadRequestErrorRaw,
	UnauthorizedError: UnauthorizedErrorRaw,
	NoPermissionError: NoPermissionErrorRaw,
	ValidationError: ValidationErrorRaw,
	TooManyRequestsError: TooManyRequestsErrorRaw,
} = coreErrors;

inherits(NotFoundErrorRaw, BaseError);
inherits(BadRequestErrorRaw, BaseError);
inherits(UnauthorizedErrorRaw, BaseError);
inherits(NoPermissionErrorRaw, BaseError);
inherits(ValidationErrorRaw, BaseError);
inherits(TooManyRequestsErrorRaw, BaseError);

export class InternalServerError extends BaseError {
	constructor(options) {
		// @ts-expect-error
		super({
			statusCode: 500,
			level: 'critical',
			errorType: 'InternalServerError',
			message: 'There was an error processing your request. Please contact support for more information',
			...options,
		});
	}
}

export class ConsistencyError extends BaseError {
	constructor(options) {
		// @ts-expect-error
		super({
			statusCode: 409,
			errorType: 'ConsistencyError',
			message: 'Something went wrong. Please contact support for more information',
			...options,
		});
	}
}

export {BaseError} from './base.js';

export const NotFoundError = NotFoundErrorRaw;
export const BadRequestError = BadRequestErrorRaw;
export const UnauthorizedError = UnauthorizedErrorRaw;
export const NoPermissionError = NoPermissionErrorRaw;
export const ValidationError = ValidationErrorRaw;
export const TooManyRequestsError = TooManyRequestsErrorRaw;
