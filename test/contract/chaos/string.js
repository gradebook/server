// @ts-check
import {between} from './generic.js';

/**
 * @typedef {{
 *   min: number;
 *   max: number;
 *   alphabet: string;
 * }} StringConstraints
 */

/** @type {StringConstraints} */
const DEFAULT_STRING_CONSTRAINTS = {
	min: 0,
	max: 500,
	alphabet: 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*()_+{}[];\':",./<>?',
};

// @TODO: depend on faker for this?
/** @param {Partial<StringConstraints>} constraints */
export function generateString(constraints = {}) {
	const {min, max, alphabet: stringAlphabet} = Object.assign({}, DEFAULT_STRING_CONSTRAINTS, constraints);
	const alphabet = stringAlphabet.split('');
	const alphabetSize = alphabet.length;

	let length = between(min, max);
	let response = '';

	while (length > 0) {
		response += alphabet[between(0, alphabetSize)];
		length--;
	}

	return response;
}

