// @ts-check
const errors = require('../../errors');

/**
 * @typedef {import('../../../global').Request} Request
 * @typedef {{[settings: string]: {isValid: (value: any) => boolean}}} Settings
 * @typedef {(req: Request, _) => void} RequestHandler
 */

/**
 * @name createSettingsValidator
 * @param {Settings} settings
 * @returns {RequestHandler}
 */
module.exports = settings => (req, _) => {
	if (!('key' in req.query && 'value' in req.body)) {
		throw new errors.ValidationError({message: 'Invalid request body'});
	}

	const {value} = req.body;
	const {key} = req.query;

	if (Array.isArray(key)) {
		throw new errors.BadRequestError({message: 'Cannot update multiple values at once'});
	}

	if (!(key in settings)) {
		throw new errors.NotFoundError({message: `Setting ${key} does not exist`});
	}

	if (!settings[key].isValid(value)) {
		throw new errors.ValidationError({message: 'Value is not valid'});
	}
};
