// @ts-check

import ts from 'typescript';
import {getMemberName} from './ts-util.js';

/**
 * @typedef {{
 *   min: number;
 *   max: number;
 *   alphabet: string;
 * }} StringConstraints
 *
 * @typedef {{
 *   min: number;
 *   max: number;
 * }} ArrayConstraints
 */

/** @type {StringConstraints} */
const DEFAULT_STRING_CONSTRAINTS = {
	min: 0,
	max: 500,
	alphabet: 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*()_+{}[];\':",./<>?',
};

/** @type {ArrayConstraints} */
const DEFAULT_ARRAY_CONSTRAINTS = {
	min: 0,
	max: 25,
};

/**
 * @param {number} min
 * @param {number} max
 */
const between = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// @TODO: depend on faker for this?
/** @param {Partial<StringConstraints>} constraints */
function generateString(constraints = {}) {
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

/**
 * @param {ts.TypeNode} schema
 * @param {Partial<ArrayConstraints>} constraints
 * @param {string} errorContext
 */
function generateArrayOf(schema, errorContext, constraints = {}) {
	const {min, max} = Object.assign({}, DEFAULT_ARRAY_CONSTRAINTS, constraints);
	const localErrorContext = `Fill ${errorContext}`;
	return Array.from(
		{length: between(min, max)},
		() => generateSingleValue(schema, localErrorContext),
	);
}

/**
 * @param {ts.TypeNode} schema
 * @param {string} errorContext
 */
function generateSingleValue(schema, errorContext) {
	if (schema.kind === ts.SyntaxKind.StringKeyword) {
		return generateString();
	}

	if (schema.kind === ts.SyntaxKind.BooleanKeyword) {
		return Boolean(between(0, 1));
	}

	if (ts.isArrayTypeNode(schema)) {
		return generateArrayOf(schema.elementType, errorContext);
	}

	throw new Error(`Payload generation failed on "${errorContext}" - value generation not implemented`);
}

/**
 * @param {ts.NodeArray<ts.TypeElement>} elements
 */
export function generatePayload(elements) {
	/** @type {Record<string, unknown>} */
	const payload = {};

	for (const element of elements) {
		const name = getMemberName(element);
		if (!ts.isPropertySignature(element)) {
			throw new Error(`Payload generation failed on "${name}" - not implemented`);
		}

		if (!element.type) {
			throw new Error(`Payload generation failed on "${name}" - type definition is missing`);
		}

		payload[name] = generateSingleValue(element.type, name);
	}

	return payload;
}
