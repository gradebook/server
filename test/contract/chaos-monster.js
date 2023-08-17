// @ts-check

import ts from 'typescript';
import {assertTypeArgumentCount, getMemberName, getTypeName, resolveTypeReference} from './ts-util.js';
import {between, context} from './chaos/generic.js';
import {ConstrainedString, generateString} from './chaos/string.js';
import {NumberBetween, generateNumber} from './chaos/number.js';
import {generateArrayOf, resolveConstrainedArray} from './chaos/array.js';

/**
 * @typedef {import('./context.js').Context} Context
 */

/**
 * @type {Record<string, (schema: ts.NodeArray<ts.TypeNode>, context: Context) => unknown>}
 */
const rootResolvers = {
	ConstrainedString,
	ConstrainedArray(schema, context) {
		const {definition, constraints} = resolveConstrainedArray(schema, context);
		return generateArrayOf(generateSingleValue, definition, context, constraints);
	},
	Between: NumberBetween,
	Stringified(schema, context) {
		assertTypeArgumentCount(schema, 1, context);
		return JSON.stringify(generateSingleValue(schema[0], context));
	},
	Array(schema, context) {
		assertTypeArgumentCount(schema, 1, context);
		return generateArrayOf(generateSingleValue, schema[0], context);
	},
	Random(schema, context) {
		assertTypeArgumentCount(schema, 1, context);
		const type = schema[0];
		if (ts.isUnionTypeNode(type)) {
			const index = between(0, type.types.length - 1);
			return generateSingleValue(type.types[index], context);
		}

		context.throw('First type argument should be a union type');
	},
};

/**
 * @param {ts.TupleTypeNode} schema
 * @param {Context} context
 */
function generateTuple(schema, context) {
	return schema.elements.map(element => {
		if (!ts.isNamedTupleMember(element)) {
			return generateSingleValue(element, context);
		}

		try {
			context.push(getMemberName(element));
			return generateSingleValue(element.type, context);
		} finally {
			context.pop();
		}
	});
}

/**
 * @param {ts.TemplateLiteralTypeNode} schema
 * @param {Context} context
 */
function resolveTemplateLiteralType(schema, context) {
	let response = '';

	for (const [index, member] of schema.templateSpans.entries()) {
		let name = `index ${index}`;
		try {
			name = `${getTypeName(member.type)} (${index})`;
		} catch {}

		context.push(` > ${name}`);

		try {
			response += String(generateSingleValue(member.type, context));
			response += member.literal.text;
		} finally {
			context.pop();
		}
	}

	return response;
}

/**
 * @param {ts.TypeNode} schema
 * @param {Context} context
 */
function generateSingleValue(schema, context) {
	if (schema.kind === ts.SyntaxKind.StringKeyword) {
		return generateString();
	}

	if (schema.kind === ts.SyntaxKind.NumberKeyword) {
		return generateNumber();
	}

	if (schema.kind === ts.SyntaxKind.BooleanKeyword) {
		return Boolean(between(0, 1));
	}

	if (ts.isArrayTypeNode(schema)) {
		return generateArrayOf(generateSingleValue, schema.elementType, context);
	}

	if (ts.isTypeReferenceNode(schema)) {
		return resolveTypeReference(rootResolvers, schema, context);
	}

	if (ts.isTypeLiteralNode(schema)) {
		try {
			context.push(' > ');
			return generatePayload(schema.members);
		} finally {
			context.pop();
		}
	}

	if (ts.isLiteralTypeNode(schema)) {
		const literal = schema.literal;
		if (literal.kind === ts.SyntaxKind.NullKeyword) {
			return null;
		}

		if (literal.kind === ts.SyntaxKind.FalseKeyword) {
			return false;
		}

		if (literal.kind === ts.SyntaxKind.TrueKeyword) {
			return true;
		}

		if (ts.isLiteralExpression(literal)) {
			if (ts.isNumericLiteral(literal)) {
				return Number(literal.text);
			}

			return literal.text;
		}
	}

	if (ts.isTupleTypeNode(schema)) {
		return generateTuple(schema, context);
	}

	if (ts.isTemplateLiteralTypeNode(schema)) {
		return resolveTemplateLiteralType(schema, context);
	}

	context.throw('value generation is not implemented');
}

/**
 * @param {ts.NodeArray<ts.TypeElement>} elements
 */
export function generatePayload(elements) {
	/** @type {Record<string, unknown>} */
	const payload = {};

	for (const element of elements) {
		const name = getMemberName(element);
		context.push(name);
		try {
			if (!ts.isPropertySignature(element)) {
				context.throw('not implemented');
				return {}; // Unreachable
			}

			if (!element.type) {
				context.throw('type definition is missing');
				return {}; // Unreachable
			}

			payload[name] = generateSingleValue(element.type, context);
		} finally {
			context.pop();
		}
	}

	return payload;
}
