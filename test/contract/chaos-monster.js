// @ts-check

import ts from 'typescript';
import {getMemberName} from './ts-util.js';
import {between} from './chaos/generic.js';
import {generateString} from './chaos/string.js';

/**
 *
 * @typedef {{
 *   min: number;
 *   max: number;
 * }} ArrayConstraints
 */

/** @type {ArrayConstraints} */
const DEFAULT_ARRAY_CONSTRAINTS = {
	min: 0,
	max: 25,
};

/**
 */

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
