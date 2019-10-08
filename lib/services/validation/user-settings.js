const errors = require('../../errors');
const SETTINGS = {
	tourStep: {
		isValid(value) {
			return value >= 0 && value <= 10;
		}
	}
}

module.exports = function validateForReadAndDelete(req, _, next) {
	if (!('key' in req.body && 'value' in req.body)) {
		throw new errors.ValidationError({message: 'Invalid request body'});
	}

	const {key, value} = req.body;
	if (!SETTINGS.hasOwnProperty(key)) {
		throw new errors.NotFoundError({message: `Setting ${key} does not exist`});
	}

	if (!SETTINGS[key].isValid(value)) {
		throw new errors.ValidationError({message: 'Value is not valid'});
	}

	next();
};
