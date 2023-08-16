// @ts-check
import ts from 'typescript';
import {Context} from '../context.js';

/**
 * @param {number} min
 * @param {number} max
 */
export const between = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const context = new Context('Payload generation');

/**
 * @param {ts.TypeNode} typeArgument
 * @returns {{types: ReadonlyArray<ts.TypeNode>; description: string}}
 * @param {Context} context
 */
export function getTypes(typeArgument, context) {
	if (ts.isIntersectionTypeNode(typeArgument)) {
		context.throw('Intersections (&) are not type-safe - use unions (|).');
	}

	if (ts.isUnionTypeNode(typeArgument)) {
		return {types: typeArgument.types, description: 'union'};
	}

	if (ts.isTypeReferenceNode(typeArgument)) {
		return {types: [typeArgument], description: ''};
	}

	context.throw('unknown type argument');
	return {types: [], description: 'Unreachable'};
}
