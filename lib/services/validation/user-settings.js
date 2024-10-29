// @ts-check
import {isSemester} from '../../utils/semester-key-valid.js';
import {createSettingsValidator} from './settings.js';

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
	uiShiftSeasons: {
		isValid: isBoolean,
	},
	previous_notification: { // eslint-disable-line camelcase
		isValid: value => new Date(value).toString() !== 'Invalid Date',
	},
	// @todo: deprecate
	overallCredits: {
		isValid: isBetween(0, 999),
	},
	// @todo: deprecate
	overallGpa: {
		isValid: isBetween(0, 5),
	},
	// @todo: deprecate
	gpaSemester: {
		isValid: isSemester,
	},
	feedbackSemester: {
		isValid: isSemester,
	},
};

export default createSettingsValidator(settings, 'user');
