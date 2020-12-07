// @ts-check
const semesterCodeIsValid = require('../../utils/semester-key-valid');
const createSettingsValidator = require('./settings');

const isBoolean = value => typeof value === 'boolean';

const settings = {
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
		isValid: value => ((!isNaN(value)) && (value >= 0) && (value < 1000))
	},
	overallGpa: {
		isValid: value => ((!isNaN(value)) && (value >= 0) && (value <= 5))
	},
	gpaSemester: {
		isValid: semesterCodeIsValid
	}
};

module.exports = createSettingsValidator(settings);
