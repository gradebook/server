// @ts-check
import process from 'node:process';
import fs from 'node:fs/promises';
import createDebug from 'debug';
import chalk from 'chalk';
import ts from 'typescript';
import supertest from 'supertest';
import * as testUtils from '../utils/index.js';
import {startTestServer as makeApp} from '../utils/app.js';
import {
	interfaceFilter, extractTypingMetadata, VirtualHost, dedupeDiagnostics, formatDiagnostic,
} from './ts-util.js';
import {clientDependencies} from './dependencies.js';

const {TEST_HOST_NAME} = testUtils.config;

const useTypescriptFormatter = false;

const debug = createDebug('gb:contract');

debug('Starting app and reading client files');
const [vfs, app] = await (async function () {
	const response = {};
	/** @type {Awaited<ReturnType<makeApp>>} */
	let app;
	await Promise.all([
		...Object.entries(clientDependencies).map(([file, fileName]) => fs.readFile(fileName, 'utf8')
			.then(contents => {
				response[file] = contents;
			}),
		),
		makeApp().then(r => {
			debug('app started');
			app = r;
		}),
	]);

	return [response, app];
})();

/**
 * @param {string} path
 * @param {'get'} method
 */
async function makeRequest(path, method = 'get') {
	return supertest(app)[method](`/api/v0/${path}`)
		.set('host', TEST_HOST_NAME)
		.set('cookie', testUtils.fixtures.cookies.trusted)
		// eslint-disable-next-line promise/prefer-await-to-then
		.then(response => response.body);
}

/**
 * @param {ts.InterfaceDeclaration['members'][number]} member
 * @param {Map<string, string>} fileNameToTestCase
 */
async function addTestCase(member, fileNameToTestCase) {
	const {name, expectedType, skip, only} = extractTypingMetadata(member);

	if (skip) {
		return {name, skip};
	}

	/** @type {Parameters<makeRequest>[1]} */
	let method = 'get';
	let requestUrl = name;

	if (requestUrl.includes(':')) {
		let rawMethod;
		([rawMethod, requestUrl] = requestUrl.split(':'));

		if (rawMethod !== 'get') {
			throw new Error(`${chalk.cyan(name)} is invalid - cannot make ${chalk.red(rawMethod)} requests`);
		}

		method = rawMethod;
	}

	const proposal = JSON.stringify(await makeRequest(requestUrl, method), null, 2);
	const safeTestName = name.replaceAll(':', '__').replaceAll(/[-/]/g, '_');
	const fileName = `contract_${safeTestName}.ts`;
	fileNameToTestCase.set(fileName, name);

	vfs[fileName] = [
		'import * as n from \'./network\';',
		`export const ${safeTestName}: ${expectedType} = ${proposal};`,
	].join('\n');

	return {name: fileName, skip, only};
}

async function prepareTestCases() {
	debug('Parsing API Contract');
	const contractSource = ts.createSourceFile(rootNames[0], vfs[rootNames[0]], ts.ScriptTarget.ESNext);

	/** @type {ts.InterfaceDeclaration} */
	// @ts-expect-error the find clause ensures that this is an InterfaceDeclaration
	const contractNode = contractSource
		.statements
		.find(interfaceFilter('ApiContract'));

	debug('Creating contract response cases');
	const fileNameToTestCase = new Map();
	/** @type {string[]} */
	const testCases = [];
	/** @type {string[]} */
	const onlyTestCases = [];
	/** @type {string[]} */
	const skippedTestCases = [];
	const creationFailures = [];

	await Promise.all(
		contractNode.members.map(member =>
			addTestCase(member, fileNameToTestCase)
				.then(response => {
					if (response.skip) {
						skippedTestCases.push(response.name);
						return;
					}

					if (response.only) {
						onlyTestCases.push(response.name);
					}

					testCases.push(response.name);
				})
				.catch(error => {
					creationFailures.push(error.message);
				}),
		),
	);

	const usingFilteredTestList = onlyTestCases.length > 0;

	vfs['api.reality.ts'] = (usingFilteredTestList ? onlyTestCases : testCases)
		.map((testCase, idx) => `import * as testCase${idx} from '/${testCase.replace('.ts', '.js')}';`)
		.join('\n');

	return {
		creationFailures, fileNameToTestCase, usingFilteredTestList, skippedTestCases,
	};
}

function typeCheck() {
	debug('Typechecking');
	const program = ts.createProgram({options: {noEmit: true, lib: ['lib.es2022.d.ts']}, rootNames, host});

	const diagnostics = ts.getPreEmitDiagnostics(program);
	return diagnostics;
}

/**
 * @param {number} value
 * @param {[green: number, yellow: number, red: number]} stops
 */
function mapValueToColor(value, stops) {
	for (const [index, limit] of stops.entries()) {
		if (value <= limit) {
			return chalk[
				index === 0 ? 'green' : (index === 1 ? 'yellow' : 'red')
			];
		}
	}

	return chalk.red;
}

/**
 * @param {string[]} creationFailures
 * @param {Readonly<ts.Diagnostic[]>} diagnostics
 * @param {Map<string, string>} fileNameToTestCase
 * @param {ts.CompilerHost} host
 */
function formatResults(creationFailures, diagnostics, fileNameToTestCase, host) {
	/** @type {[green: number, yellow: number, red: number]} */
	const errorColorMap = [0, 1, 2];
	debug('Formatting response');
	/* eslint-disable no-console */
	if (creationFailures.length > 0) {
		const errorCount = creationFailures.length;
		const errors = errorCount === 1 ? 'error' : 'errors';
		const formatter = mapValueToColor(errorCount, errorColorMap);
		console.log(formatter(`${errorCount} ${errors} creating test cases:`));

		for (const failure of creationFailures) {
			console.log('\t%s', failure);
		}

		console.log();
	}

	let totalErrorCount = creationFailures.length;

	if (diagnostics.length > 0) {
		const dedupedDiagnostics = dedupeDiagnostics(diagnostics);
		const errorCount = dedupedDiagnostics.length;
		const errors = errorCount === 1 ? 'contract issue' : 'contract issues';
		const formatter = mapValueToColor(errorCount, errorColorMap);
		console.log(formatter(`${errorCount} ${errors}`));

		if (useTypescriptFormatter) {
			console.log(ts.formatDiagnosticsWithColorAndContext(dedupedDiagnostics, host));
		} else {
			for (const diagnostic of dedupedDiagnostics) {
				console.log(formatDiagnostic(diagnostic, fileNameToTestCase, host));
			}
		}

		totalErrorCount += dedupedDiagnostics.length;
	}

	return totalErrorCount;
}

const rootNames = ['api.contract.ts', 'api.reality.ts'];
const host = new VirtualHost(vfs);

const {creationFailures, fileNameToTestCase, usingFilteredTestList, skippedTestCases} = await prepareTestCases();
const diagnostics = typeCheck();
let errorCount = formatResults(creationFailures, diagnostics, fileNameToTestCase, host);

if (usingFilteredTestList) {
	if (process.env.CI) {
		console.log('Don\'t use "Only" types in CI');
		errorCount++;
	} else {
		console.warn(
			chalk.yellow('One or more "Only" types has been used. This should be limited to local testing only.'),
		);
	}
}

for (const testCase of fileNameToTestCase.values()) {
	console.log('  %s %s', chalk.yellow('🟡'), testCase);
}

for (const testCase of skippedTestCases) {
	console.log('  %s  %s', chalk.cyan('⏸'), testCase);
	continue;
}

console.log('Exit code:', errorCount);

// eslint-disable-next-line unicorn/no-process-exit
process.exit(errorCount);

/* eslint-enable no-console */
