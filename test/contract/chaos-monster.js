// @ts-check

import ts from 'typescript';
import {getMemberName, resolveTypeReference} from './ts-util.js';
import {between, context} from './chaos/generic.js';
import {ConstrainedString, generateString} from './chaos/string.js';

/**
 * @typedef {import('./context.js').Context} Context
 *
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
 * @type {Record<string, (schema: ts.NodeArray<ts.TypeNode>, context: Context) => unknown>}
 */
const rootResolvers = {
	ConstrainedString,
};

/**
 * @param {ts.TypeNode} schema
 * @param {Partial<ArrayConstraints>} constraints
 * @param {Context} context
 */
function generateArrayOf(schema, context, constraints = {}) {
	const {min, max} = Object.assign({}, DEFAULT_ARRAY_CONSTRAINTS, constraints);
	context.unshift('Fill');

	try {
		return Array.from(
			{length: between(min, max)},
			() => generateSingleValue(schema, context),
		);
	} finally {
		context.shift();
	}
}

/**
 * @param {ts.TypeNode} schema
 * @param {Context} context
 */
function generateSingleValue(schema, context) {
	if (schema.kind === ts.SyntaxKind.StringKeyword) {
		return generateString();
	}

	if (schema.kind === ts.SyntaxKind.BooleanKeyword) {
		return Boolean(between(0, 1));
	}

	if (ts.isArrayTypeNode(schema)) {
		return generateArrayOf(schema.elementType, context);
	}

	if (ts.isTypeReferenceNode(schema)) {
		return resolveTypeReference(rootResolvers, schema, context);
	}

	context.throw('value generation is not implemented');
}

/**
 * @param {ts.NodeArray<ts.TypeElement>} elements
 * @param {string} initialContext
 */
export function generatePayload(elements, initialContext) {
	/** @type {Record<string, unknown>} */
	const payload = {};

	context.push(initialContext);

	for (const element of elements) {
		const name = getMemberName(element);
		context.push(` > ${name}`);
		try {
			if (!ts.isPropertySignature(element)) {
				context.throw('not implemented');
				return null; // Unreachable
			}

			if (!element.type) {
				context.throw('type definition is missing');
				return null; // Unreachable
			}

			payload[name] = generateSingleValue(element.type, context);
		} finally {
			context.pop();
		}
	}

	context.pop();

	return payload;
}
