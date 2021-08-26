// @ts-check
const semesterCodeIsValid = require('../../utils/semester-key-valid');
const createSettingsValidator = require('./settings');

/**
 * @param {any} value
 * @returns {boolean}
 */
const isBoolean = value => typeof value === 'boolean';

/**
 * @description Determine if {value} is a valid number between {lowerBounds} and {upperBounds} (inclusive)
 * @param {number} lowerBounds
 * @param {number} upperBounds
 * @returns {(value: any) => boolean}
 */
const isBetween = (lowerBounds, upperBounds) =>
	/* eslint-disable-next-line unicorn/prefer-number-properties */
	value => !isNaN(value) && value >= lowerBounds && value <= upperBounds;

// Allows for 24 states
const LARGEST_TOUR_STEP = 0b1111_1111_1111_1111_1111_1111;

const settings = {
	tour: {
		isValid: isBetween(0, LARGEST_TOUR_STEP),
	},
	redirectFromHome: {
		isValid: isBoolean,
	},
	previous_notification: { // eslint-disable-line camelcase
		isValid: value => new Date(value).toString() !== 'Invalid Date',
	},
	overallCredits: {
		isValid: isBetween(0, 999),
	},
	overallGpa: {
		isValid: isBetween(0, 5),
	},
	gpaSemester: {
		isValid: semesterCodeIsValid,
	},
};

module.exports = createSettingsValidator(settings);
