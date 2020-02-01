const errors = require('../../errors');

const isBoolean = value => typeof value === 'boolean';

const SETTINGS = {
	tour: {
		isValid: isBoolean
	},
	redirectFromHome: {
		isValid: isBoolean
	},
	previous_notification: { // eslint-disable-line camelcase
		isValid: value => new Date(value).toString() !== 'Invalid Date'
	}
};

module.exports = function validateForReadAndDelete(req, _, next) {
	if (!('key' in req.body && 'value' in req.body)) {
		throw new errors.ValidationError({message: 'Invalid request body'});
	}

	const {key, value} = req.body;
	if (!(key in SETTINGS)) {
		throw new errors.NotFoundError({message: `Setting ${key} does not exist`});
	}

	if (!SETTINGS[key].isValid(value)) {
		throw new errors.ValidationError({message: 'Value is not valid'});
	}

	next();
};
