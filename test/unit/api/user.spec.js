// @ts-check
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {user as userApi} from '../../../lib/api/user.js';
import fixtures from '../../fixtures/example-data.js';

/**
 * @param {string} globalFileContents the contents of a typescript file that contains a top-level User interface
 * @returns the first-level properties of the User interface
 */
function getUserInterfaceProperties(globalFileContents) {
	const sourceFile = ts.createSourceFile('global.d.ts', globalFileContents, ts.ScriptTarget.ES2020);
	const userInterface = sourceFile.statements.find(x => ts.isInterfaceDeclaration(x) && x.name.text === 'User');
	assert(userInterface && ts.isInterfaceDeclaration(userInterface));

	const response = [];
	for (const member of userInterface.members) {
		if (ts.isPropertySignature(member) && !ts.isComputedPropertyName(member.name)) {
			response.push(member.name.text);
		}
	}

	return response;
}

describe('Unit > API > User', function () {
	it('regression: user request type matches user request object', async function () {
		const globalTypes = await readFile(new URL('../../../global.d.ts', import.meta.url), 'utf8');
		const properties = getUserInterfaceProperties(globalTypes);
		const IGNORED_PROPERTIES = ['donated', 'totalSchoolChanges'];

		const user = await userApi.read({id: fixtures.trustedUser.id, db: ''});

		for (const property of properties) {
			assert(Object.hasOwn(user, property), `User object is missing "${property}" property`);
			delete user[property];
		}

		assert.deepEqual(Object.keys(user), IGNORED_PROPERTIES);
	});
});
