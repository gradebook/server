import assert from 'node:assert/strict';
import sinon from 'sinon';
import {UserRow} from '../../../lib/models/user.js';
import {controller as userController} from '../../../lib/controllers/user.js';

describe('Unit > Controllers > User', function () {
	describe('updateGpaSettings', function () {
		let stub;

		beforeEach(function () {
			stub = sinon.stub(UserRow.prototype, 'commit');
			stub.resolves();
		});

		afterEach(function () {
			stub.restore();
		});

		/**
		 * // @TODO: implement this
		 * @param {any} settings
		 * @param {import('../../../lib/controllers/user.js').GpaBody} body
		 */
		async function callUpdateGpaSettings(settings, body) {
			const response = {};
			await userController.updateGpaSettings({user: {settings: JSON.stringify(settings)}, body}, response);
			return response.context;
		}

		function defaultGpaSettings() {
			return {
				gpaSemester: '2024F',
				overallGpa: 3.14,
				overallCredits: 133,
				gpa: {
					'2024F': [3.14, 133],
				},
			};
		}

		it('No changes', async function () {
			const settings = defaultGpaSettings();
			const context = await callUpdateGpaSettings(settings, {
				gpaSemester: settings.gpaSemester,
				overallGpa: settings.gpa[settings.gpaSemester][0],
				overallCredits: settings.gpa[settings.gpaSemester][1],
			});

			assert.ok(!stub.called);
			assert.deepStrictEqual(context, {statusCode: 204});
		});

		it('Update GPA semester', async function () {
			// Uncommon
			const settings = defaultGpaSettings();
			const newSettings = structuredClone(settings);
			const gpaSemester = '2025S';

			// Just update the GPA semester
			newSettings.gpaSemester = gpaSemester;
			newSettings.gpa[gpaSemester] = structuredClone(settings.gpa[settings.gpaSemester]);

			const gpaSettings = newSettings.gpa[settings.gpaSemester];

			const context = await callUpdateGpaSettings(settings, {
				gpaSemester,
				overallGpa: gpaSettings[0],
				overallCredits: gpaSettings[1],
			});

			assert.ok(stub.called);
			assert.deepStrictEqual(context, {body: newSettings});
		});

		it('Update GPA fields', async function () {
			// Uncommon
			const settings = defaultGpaSettings();
			const newSettings = structuredClone(settings);
			const gpaSettings = newSettings.gpa[settings.gpaSemester];
			gpaSettings[0] += 0.1;
			gpaSettings[1] += 13;

			// @TODO: Drop this when we remove backward compatibility with client
			newSettings.overallGpa = gpaSettings[0];
			newSettings.overallCredits = gpaSettings[1];

			const context = await callUpdateGpaSettings(settings, {
				gpaSemester: settings.gpaSemester,
				overallGpa: gpaSettings[0],
				overallCredits: gpaSettings[1],
			});

			assert.ok(stub.called);
			assert.deepStrictEqual(context, {body: newSettings});
		});

		it('Update all GPA fields', async function () {
			const settings = defaultGpaSettings();
			const newSettings = structuredClone(settings);
			const gpaSemester = '2025S';
			newSettings.gpaSemester = gpaSemester;
			newSettings.gpa[gpaSemester] = structuredClone(newSettings.gpa[settings.gpaSemester]);
			const gpaSettings = newSettings.gpa[gpaSemester];
			gpaSettings[0] += 0.1;
			gpaSettings[1] += 13;

			// @TODO: Drop this when we remove backward compatibility with client
			newSettings.overallGpa = gpaSettings[0];
			newSettings.overallCredits = gpaSettings[1];

			const context = await callUpdateGpaSettings(settings, {
				gpaSemester: newSettings.gpaSemester,
				overallGpa: gpaSettings[0],
				overallCredits: gpaSettings[1],
			});

			assert.ok(stub.called);
			assert.deepStrictEqual(context, {body: newSettings});
		});
	});
});
