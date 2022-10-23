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
 * @param {string} model
 * @returns {RequestHandler}
 */
export const createSettingsValidator = (settings, model) => (request, _) => {
	if (!('key' in request.query && 'value' in request.body)) {
		throw new errors.ValidationError({message: `Failed updating ${model} setting: missing key or value`});
	}

	const {value} = request.body;
	const {key} = request.query;

	if (Array.isArray(key)) {
		throw new errors.BadRequestError({message: `${model}.settings: only one setting can be updated at a time`});
	}

	if (!(key in settings)) {
		throw new errors.NotFoundError({message: `${model}.settings.${key}: invalid setting`});
	}

	if (!settings[key].isValid(value)) {
		throw new errors.ValidationError({message: `${model}.settings.${key}: "${value}" is not a valid value`});
	}
};
