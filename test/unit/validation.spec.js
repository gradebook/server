// @ts-check
import sinon from 'sinon';
import {expect} from 'chai';
import {settings} from '../../lib/services/settings/index.js';
import * as validations from '../../lib/services/validation/index.js';
import {expectError} from '../utils/index.js';

describe('Unit > Validation', function () {
	describe('User Settings', function () {
		it('invalid request', function () {
			const request = {body: {}, query: {}};

			try {
				validations.userSettings(request, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Invalid request body');
			}
		});

		it('valid key and value', function () {
			const request = {
				body: {value: '2020-01-30T22:13:22.000-06:00'},
				query: {key: 'previous_notification'},
			};

			validations.userSettings(request, null);
		});

		it('invalid key', function () {
			const request = {
				body: {value: 8},
				query: {key: 'steal'},
			};

			try {
				validations.userSettings(request, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Setting steal does not exist');
			}
		});

		it('invalid value', function () {
			const request = {
				body: {value: '2019-09-09'},
				query: {key: 'previous_notification'},
			};

			try {
				request.body.value = 'bad';
				validations.userSettings(request, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			try {
				request.body.value = 'not a date';
				validations.userSettings(request, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			try {
				// @ts-expect-error
				request.body.value = {};
				validations.userSettings(request, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}
		});
	});

	describe('Edit Category', function () {
		describe('Only allows valid weights', function () {
			const createRequest = () => (
				{body: {}, params: {id: '5dc10582a8109cd864bd8a13'}, user: {id: '5dc1069b2ff198252ca3b596'}}
			);

			it('Lower out of bounds fails', function () {
				const request = createRequest();
				request.body.weight = -1;

				try {
					validations.editCategory(request, null);
					expectError();
				} catch (error) {
					expect(error.message).to.include('data/weight must be >= 0');
				}
			});

			it('Upper out of bounds fails', function () {
				const request = createRequest();
				request.body.weight = 19_248_124_814;

				try {
					validations.editCategory(request, null);
					expectError();
				} catch (error) {
					expect(error.message).to.include('data/weight must be <= 10000');
				}
			});

			it('Normal floating points are acceptable', function () {
				const request = createRequest();
				request.body.weight = 1234.56;
				validations.editCategory(request, null);
			});

			it('Null is acceptable', function () {
				const request = createRequest();
				request.body.weight = null;
				validations.editCategory(request, null);
			});

			it('Not providing is acceptable', async function () {
				const request = createRequest();

				request.body.name = 'Name';
				validations.editCategory(request, null);
			});
		});
	});

	describe('Edit Course', function () {
		describe('Only allows valid names', function () {
			const createRequest = () => (
				{body: {}, params: {id: '5dc10582a8109cd864bd8a13'}, user: {id: '5dc1069b2ff198252ca3b596'}}
			);

			it('Invalid', function () {
				const request = createRequest();
				request.body.name = 'Introduction to TAMU';

				try {
					validations.editCourse(request, null);
					expectError();
				} catch (error) {
					expect(error.message).to.contain('data/name must match pattern');
				}
			});

			it('valid', function () {
				const request = createRequest();
				request.body.name = 'DEMO 101';
				request.body.cutoffs = '{"A":90,"B":80,"C":70,"D":60}';

				validations.editCourse(request, null);
			});
		});
	});

	describe('Create Course', function () {
		/** @type {object} */
		const createRequest = () => ({
			query: {
				type: 'guided',
			},
			body: {
				course: {
					name: 'ECEN 482',
					semester: '2019S',
					credits: 3,
					cutoffs: '{"A":90,"B":80,"C":70,"D":60}',
				},
				categories: [
					{name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null},
					{name: 'Expanded', weight: 60, position: 200, numGrades: 3, dropped: 1},
				],
			}, params: {id: '5dc10582a8109cd864bd8a13'}, user: {id: '5dc1069b2ff198252ca3b596'},
		});

		describe('Only allows empty cutoffs with query type partial', function () {
			it('Empty cutoffs fails with guided', function () {
				const request = createRequest();
				request.body.course.cutoffs = JSON.stringify({});

				try {
					validations.createCourse(request, null);
					expectError();
				} catch (error) {
					expect(error.message).to.equal('data must NOT have fewer than 4 items');
				}
			});

			it('Empty cutoffs is allowed with partial', function () {
				const request = createRequest();
				request.query.type = 'partial';
				request.body.course.cutoffs = JSON.stringify({});

				const stub = sinon.stub(settings, 'get').returns(10);

				validations.createCourse(request, null);
				stub.restore();
			});

			it('Cutoffs are required with no query type', function () {
				const request = createRequest();
				request.body.course.cutoffs = JSON.stringify({});
				delete request.query.type;

				try {
					validations.createCourse(request, null);
					expectError();
				} catch (error) {
					expect(error.message).to.equal('data must NOT have fewer than 4 items');
				}
			});

			it('Cutoffs are not allowed with partial', function () {
				const request = createRequest();
				request.query.type = 'partial';

				try {
					validations.createCourse(request, null);
					expectError();
				} catch (error) {
					expect(error.message).to.equal('partial courses must have empty cutoffs object');
				}
			});
		});

		describe('Only allows valid number of categories', function () {
			it('Too many categories fails', function () {
				const request = createRequest();
				request.body.categories = [];

				for (let i = 0; i < 15; i++) {
					request.body.categories.push({name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null});
				}

				const stub = sinon.stub(settings, 'get').returns(10);

				try {
					validations.createCourse(request, null);
					expectError();
				} catch (error) {
					expect(error.message).to.include('too many categories');
					stub.restore();
				}
			});

			it('Reasonable number of categories passes', function () {
				const request = createRequest();
				request.body.categories = [];

				for (let i = 0; i < 5; i++) {
					request.body.categories.push({name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null});
				}

				const stub = sinon.stub(settings, 'get').returns(10);

				validations.createCourse(request, null);
				stub.restore();
			});

			it('No categories passes', function () {
				const request = createRequest();
				request.body.categories = [];

				const stub = sinon.stub(settings, 'get').returns(10);

				validations.createCourse(request, null);
				stub.restore();
			});
		});

		describe('Only allows valid number of grades', function () {
			it('Too many grades fails', function () {
				const request = createRequest();
				request.body.categories[0] = {name: 'Single', weight: 40, position: 100, numGrades: 50, dropped: null};

				const stub = sinon.stub(settings, 'get').returns(40);

				try {
					validations.createCourse(request, null);
					expectError();
				} catch (error) {
					expect(error.message).to.include('too many grades');
					stub.restore();
				}
			});

			it('Reasonable number of grades passes', function () {
				const request = createRequest();
				request.body.categories[0] = {name: 'Single', weight: 40, position: 100, numGrades: 10, dropped: null};

				const stub = sinon.stub(settings, 'get').returns(40);

				validations.createCourse(request, null);
				stub.restore();
			});
		});
	});
});
