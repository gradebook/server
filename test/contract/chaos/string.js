// @ts-check
import ts from 'typescript';
import {assertTypeArgumentCount, flattenTypeReferences} from '../ts-util.js';
import {between, getTypes} from './generic.js';

/**
 * @typedef {{
 *   min: number;
 *   max: number;
 *   alphabet: string;
 * }} StringConstraints
 *
 * @typedef {import('../context.js').Context} Context
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

/**
 * @type {Record<string, (schema: ts.NodeArray<ts.TypeNode>, context: Context) => Partial<StringConstraints>>}
 */
const constrainedStringResolvers = {
	Alphabet(schema, context) {
		assertTypeArgumentCount(schema, 1, context);
		const [alphabet] = schema;
		if (!ts.isLiteralTypeNode(alphabet) || !ts.isStringLiteral(alphabet.literal)) {
			context.throw('alphabet is not a literal string');
			return {}; // Unreachable
		}

		return {alphabet: alphabet.literal.text};
	},
	Between(schema, context) {
		assertTypeArgumentCount(schema, 2, context);
		const [min, max] = schema;
		if (!ts.isLiteralTypeNode(min) || !ts.isNumericLiteral(min.literal)) {
			context.throw('min is not a literal number');
			return {}; // Unreachable
		}

		if (!ts.isLiteralTypeNode(max) || !ts.isNumericLiteral(max.literal)) {
			context.throw('max is not a literal number');
			return {}; // Unreachable
		}

		return {min: Number(min.literal.text), max: Number(max.literal.text)};
	},
};

/**
 * @param {ts.NodeArray<ts.TypeNode>} schema
 * @param {Context} context
 * @returns {string}
 */
export function ConstrainedString(schema, context) {
	assertTypeArgumentCount(schema, 1, context);
	const typeArgument = schema[0];

	const {types: rawConstraints, description} = getTypes(typeArgument, context);
	const constraints = flattenTypeReferences(constrainedStringResolvers, rawConstraints, description, context);
	return generateString(constraints);
}
