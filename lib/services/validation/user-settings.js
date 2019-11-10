const errors = require('../../errors');

const SETTINGS = {
	tour: {
		isValid(value) {
			return typeof value === 'boolean';
		}
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
