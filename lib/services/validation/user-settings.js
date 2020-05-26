const errors = require('../../errors');
const semesterCodeIsValid = require('../../utils/semester-key-valid');

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
	},
	overallCredits: {
		isValid: value => ((!isNaN(value)) & (value >= 0) & (value < 1000))
	},
	overallGpa: {
		isValid: value => ((!isNaN(value)) & (value >= 0) & (value <= 5))
	},
	gpaUpdatedAt: {
		isValid: semesterCodeIsValid
	}
};

/** @param {Express.Request} req */
module.exports = function validateForReadAndDelete(req, _) {
	if (!('key' in req.query && 'value' in req.body)) {
		throw new errors.ValidationError({message: 'Invalid request body'});
	}

	const {value} = req.body;
	const {key} = req.query;

	if (!(key in SETTINGS)) {
		throw new errors.NotFoundError({message: `Setting ${key} does not exist`});
	}

	if (!SETTINGS[key].isValid(value)) {
		throw new errors.ValidationError({message: 'Value is not valid'});
	}
};
