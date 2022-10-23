// @ts-check
import * as errors from '../../errors/index.js';

/**
 * @typedef {Gradebook.Request} Request
 * @typedef {Gradebook.Response} Response
 * @typedef {{[settings: string]: {isValid: (value: any) => boolean}}} Settings
 * @typedef {(request: Request, response: Response) => void} RequestHandler
 */

/**
 * @name createSettingsValidator
 * @param {Settings} settings
 * @returns {RequestHandler}
 */
export const createSettingsValidator = settings => (request, _) => {
	if (!('key' in request.query && 'value' in request.body)) {
		throw new errors.ValidationError({message: 'Invalid request body'});
	}

	const {value} = request.body;
	const {key} = request.query;

	if (Array.isArray(key)) {
		throw new errors.BadRequestError({message: 'Cannot update multiple values at once'});
	}

	if (!(key in settings)) {
		throw new errors.NotFoundError({message: `Setting ${key} does not exist`});
	}

	if (!settings[key].isValid(value)) {
		throw new errors.ValidationError({message: `course.settings.${key}: "${value}" is not a valid value.`});
	}
};
