// @ts-check
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import syncFs from 'node:fs';
import ts from 'typescript';
import chalk from 'chalk';

const NETWORK_NAMESPACE = 'n';
const LIB_ROOT = '../../node_modules/typescript/lib/';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * @typedef {import('./context.js').Context} Context
 */

/**
 * @param {ts.TypeElement | ts.InterfaceDeclaration | ts.QualifiedName | ts.TypeReferenceNode | ts.TypeNode} member
 */
export function getMemberName(member, property = 'name') {
	const name = member[property];
	if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) {
		return ts.idText(name);
	}

	if (ts.isStringLiteral(name)) {
		return name.text;
	}

	throw new Error('Unable to get name of member');
}

/** @param {ts.TypeReferenceNode | ts.TypeNode} type */
export function getTypeName(type) {
	return getMemberName(type, 'typeName');
}

/**
 * @param {string} name
 * @returns {(candidate: ts.Statement) => boolean}
 */
export function interfaceFilter(name) {
	return candidate => ts.isInterfaceDeclaration(candidate) && getMemberName(candidate) === name;
}

/** @param {ts.InterfaceDeclaration['members'][number]} member */
export function extractTypingMetadata(member) {
	const name = getMemberName(member);

	if (!ts.isPropertySignature(member) || !member.type) {
		throw new Error(`Unable to process ${name}`);
	}

	/** @type {ts.QualifiedName} */
	let activeMemberType;
	let renderedTypeSuffix = '';
	let only = false;
	let skip = false;

	if (
		ts.isArrayTypeNode(member.type)
		&& ts.isTypeReferenceNode(member.type.elementType)
		&& ts.isQualifiedName(member.type.elementType.typeName)
	) {
		activeMemberType = member.type.elementType.typeName;
		renderedTypeSuffix = '[]';
	} else if (
		ts.isTypeReferenceNode(member.type)
		&& ts.isQualifiedName(member.type.typeName)
	) {
		activeMemberType = member.type.typeName;
	} else if (
		ts.isTypeReferenceNode(member.type)
		&& ts.isIdentifier(member.type.typeName)
	) {
		const memberText = member.type.typeName.escapedText;
		if (!(memberText === 'Skip' || memberText === 'Only')) {
			throw new Error(`Unable to resolve contract for "${name}" - unknown type-based command "${memberText}"`);
		}

		// @ts-expect-error the next line confirms that it is in fact, not `undefined`
		const root = member.type.typeArguments[0];
		if (!ts.isTypeReferenceNode(root) || !ts.isQualifiedName(root.typeName)) {
			throw new Error(
				`Unable to resolve contract for "${name}" - failed analyzing argument for ${memberText}`,
			);
		}

		activeMemberType = root.typeName;

		skip = memberText === 'Skip';
		only = memberText === 'Only';
	} else if (
		ts.isUnionTypeNode(member.type)
		|| ts.isIntersectionTypeNode(member.type)
	) {
		throw new Error(`Unable to resolve contract for "${name} - types should be defined in the network (${NETWORK_NAMESPACE}).`);
	} else {
		throw new Error(`Unable to resolve contract for "${name}"`);
	}

	const lhs = getMemberName(activeMemberType, 'left');
	const expectedType = getMemberName(activeMemberType, 'right');

	if (lhs !== NETWORK_NAMESPACE) {
		throw new Error(`${name} is invalid - expected format "${NETWORK_NAMESPACE}.{interface}", but got ${lhs}.{...}`);
	}

	return {
		name,
		expectedType: `${NETWORK_NAMESPACE}.${expectedType}${renderedTypeSuffix}`,
		skip,
		only,
	};
}

/**
 * @param {ts.NodeArray<ts.TypeNode>} schema
 * @param {number} count
 * @param {Context} context
 */
export function assertTypeArgumentCount(schema, count, context) {
	if (schema.length !== count) {
		context.throw(`expected ${count} type argument(s) but got ${schema.length}`);
	}
}

/**
 * @template {string} T
 * @template U
 * @param {Record<T, (schema: ts.NodeArray<ts.TypeNode>, context: Context) => U>} resolvers
 * @param {ReadonlyArray<ts.TypeNode>} pipeline
 * @param {string} description
 * @param {Context} context
 */
export function flattenTypeReferences(resolvers, pipeline, description, context) {
	const localResolvers = {...resolvers};
	const response = {};

	for (const [index, next] of pipeline.entries()) {
		if (!ts.isTypeReferenceNode(next)) {
			if (description) {
				context.push(` of ${description} (#${index + 1})`);
			}

			context.throw('not a type reference');
		}

		Object.assign(response, resolveTypeReference(localResolvers, next, context));
		delete localResolvers[getMemberName(next, 'typeName')];
	}

	return response;
}

/**
 * @template {string} T
 * @template U
 * @param {Record<T, (schema: ts.NodeArray<ts.TypeNode>, context: Context) => U>} resolvers
 * @param {ts.TypeReferenceNode} schema
 * @param {Context} context
 * @returns {unknown}
 */
export function resolveTypeReference(resolvers, schema, context) {
	const referenceName = getMemberName(schema, 'typeName');
	const referenceResolver = resolvers[referenceName];

	context.push(` > ${referenceName}`);

	if (!referenceResolver) {
		context.throw(`unknown constraint "${referenceName}"`);
	}

	if (!schema.typeArguments) {
		context.throw(`no type arguments to "${referenceName}"`);
	}

	try {
		return referenceResolver(schema.typeArguments, context);
	} finally {
		context.pop();
	}
}

/**
 * @param {Readonly<ts.Diagnostic[]>} diagnostics
 */
export function dedupeDiagnostics(diagnostics) {
	const fastChecker = new Set();
	const slowChecker = new Set();
	const response = [];

	for (const diagnostic of diagnostics) {
		const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		if (fastChecker.has(message)) {
			continue;
		}

		const slimMessage = message.replace(/(missing in type)\s'(.*?)'\s(.*)/, '$1 (response) $3');

		if (slowChecker.has(slimMessage)) {
			continue;
		}

		fastChecker.add(message);
		slowChecker.add(slimMessage);
		response.push(diagnostic);
	}

	return response;
}

/**
 * @param {Readonly<ts.Diagnostic>} diagnostic
 * @param {Map<string, string>} fileNameToTestCase
 * @param {ts.CompilerHost} host
 */
export function formatDiagnostic(diagnostic, fileNameToTestCase, host) {
	if (!diagnostic.file || typeof diagnostic.start === 'undefined') {
		throw new Error('test');
	}

	const testName = fileNameToTestCase.get(diagnostic.file.fileName.replace('/', '')) ?? diagnostic.file.fileName;
	const line = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
	let output = '';

	/** @type {Record<ts.DiagnosticCategory, 'red' | 'yellow' | 'blue'>} */
	const diagnosticTypeMap = {
		[ts.DiagnosticCategory.Error]: 'red',
		[ts.DiagnosticCategory.Warning]: 'yellow',
		[ts.DiagnosticCategory.Suggestion]: 'blue',
		[ts.DiagnosticCategory.Message]: 'blue',
	};

	output += chalk.cyan(testName);
	output += chalk.reset(':');
	output += chalk.yellow(line.line);
	output += chalk.reset(':');
	output += chalk.yellow(line.character);
	output += ' - ';
	output += chalk[diagnosticTypeMap[diagnostic.category]](ts.DiagnosticCategory[diagnostic.category]);
	output += chalk.reset(': ');

	const rawErrorMessage = ts.flattenDiagnosticMessageText(diagnostic.messageText, host.getNewLine());

	output += rawErrorMessage.includes('missing in type')
		? rawErrorMessage.replace(/in type '(.*?)' but required in type/, 'from')
		: rawErrorMessage;

	output += host.getNewLine();
	output += chalk.blue('API Response:');
	output += host.getNewLine();
	output += host.readFile(diagnostic.file.fileName);

	return output;
}

/** @implements {ReturnType<ts['createCompilerHost']>} */
export class VirtualHost {
	constructor(vfs) {
		this.vfs = vfs;
	}

	getSourceFile(fileName, languageVersion) {
		const contents = this.readFile(fileName) ?? '';
		return ts.createSourceFile(fileName, contents, languageVersion);
	}

	getDefaultLibFileName = () => 'lib.esnext.d.ts';
	writeFile() {}
	getCurrentDirectory = () => '/';
	getCanonicalFileName = fileName => fileName;
	useCaseSensitiveFileNames = () => false;
	getNewLine = () => '\n';

	fileExists(rawFileName) {
		const fileName = rawFileName.replace('/', '');
		return fileName in this.vfs;
	}

	readFile(rawFileName) {
		const fileName = rawFileName.replace('/', '');
		if (fileName.startsWith('lib.es')) {
			return syncFs.readFileSync(path.resolve(__dirname, LIB_ROOT, fileName), 'utf8');
		}

		return this.vfs[fileName];
	}
}
