// @ts-check
import ts from 'typescript';
import {assertTypeArgumentCount, flattenTypeReferences} from '../ts-util.js';
import {between, Between, getTypes} from './generic.js';

/**
 * @typedef {import('../context.js').Context} Context
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
 * @param {(schema: ts.TypeNode, context: Context) => unknown} generateSingleValue
 * @param {ts.TypeNode} schema
 * @param {Partial<ArrayConstraints>} constraints
 * @param {Context} context
 */
export function generateArrayOf(generateSingleValue, schema, context, constraints = {}) {
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
 * @type {Record<string, (schema: ts.NodeArray<ts.TypeNode>, context: Context) => Partial<ArrayConstraints>>}
 */
const constrainedArrayResolvers = {
	Between,
};

/**
 * @param {ts.NodeArray<ts.TypeNode>} schema
 * @param {Context} context
 */
export function resolveConstrainedArray(schema, context) {
	assertTypeArgumentCount(schema, 2, context);

	if (ts.isTypeReferenceNode(schema[1])) {
		const {types, description} = getTypes(schema[1], context);
		return {
			definition: schema[0],
			constraints: flattenTypeReferences(constrainedArrayResolvers, types, description, context),
		};
	}

	context.throw('');
}
