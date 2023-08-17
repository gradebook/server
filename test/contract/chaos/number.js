// @ts-check
/**
 * @typedef {{
 *   min: number;
 *   max: number;
 * }} NumberConstraints
 */

import {Between as parseBetweenType, between} from './generic.js';

/** @type {NumberConstraints} */
const DEFAULT_NUMBER_CONSTRAINTS = {
	min: -500,
	max: -500,
};

/**
 * @param {Partial<NumberConstraints>} [constraints]
 */
export function generateNumber(constraints = {}) {
	const {min, max} = Object.assign({}, DEFAULT_NUMBER_CONSTRAINTS, constraints);
	return between(min, max);
}

/**
 * @param {Parameters<typeof parseBetweenType>[0]} schema
 * @param {Parameters<typeof parseBetweenType>[1]} context
 */
export function NumberBetween(schema, context) {
	return generateNumber(parseBetweenType(schema, context));
}
