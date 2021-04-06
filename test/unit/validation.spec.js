const settings = require('../../lib/services/settings');
const validations = require('../../lib/services/validation');
const expectError = require('../utils/expect-error');

describe('Unit > Validation', function () {
	describe('User Settings', function () {
		it('invalid request', function () {
			const req = {body: {}, query: {}};

			try {
				validations.userSettings(req, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Invalid request body');
			}
		});

		it('valid key and value', function () {
			const req = {
				body: {value: '2020-01-30T22:13:22.000-06:00'},
				query: {key: 'previous_notification'}
			};

			validations.userSettings(req, null);
		});

		it('invalid key', function () {
			const req = {
				body: {value: 8},
				query: {key: 'steal'}
			};

			try {
				validations.userSettings(req, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Setting steal does not exist');
			}
		});

		it('invalid value', function () {
			const req = {
				body: {value: '2019-09-09'},
				query: {key: 'previous_notification'}
			};

			try {
				req.body.value = 'bad';
				validations.userSettings(req, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			try {
				req.body.value = 'not a date';
				validations.userSettings(req, null);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			try {
				req.body.value = {};
				validations.userSettings(req, null);
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
				const req = createRequest();
				req.body.weight = -1;

				try {
					validations.editCategory(req, null);
					expectError();
				} catch (error) {
					expect(error.message).to.include('data/weight must be >= 0');
				}
			});

			it('Upper out of bounds fails', function () {
				const req = createRequest();
				req.body.weight = 19248124814;

				try {
					validations.editCategory(req, null);
					expectError();
				} catch (error) {
					expect(error.message).to.include('data/weight must be <= 10000');
				}
			});

			it('Normal floating points are acceptable', function () {
				const req = createRequest();
				req.body.weight = 1234.56;
				validations.editCategory(req, null);
			});

			it('Null is acceptable', function () {
				const req = createRequest();
				req.body.weight = null;
				validations.editCategory(req, null);
			});

			it('Not providing is acceptable', async function () {
				const req = createRequest();

				req.body.name = 'Name';
				validations.editCategory(req, null);
			});
		});
	});

	describe('Edit Course', function () {
		describe('Only allows valid names', function () {
			const createRequest = () => (
				{body: {}, params: {id: '5dc10582a8109cd864bd8a13'}, user: {id: '5dc1069b2ff198252ca3b596'}}
			);

			it('Invalid', function () {
				const req = createRequest();
				req.body.name = 'Introduction to TAMU';

				try {
					validations.editCourse(req, null);
					expectError();
				} catch (error) {
					expect(error.message).to.contain('data/name must match pattern');
				}
			});

			it('valid', function () {
				const req = createRequest();
				req.body.name = 'DEMO 101';
				req.body.cutoffs = '{"A":90,"B":80,"C":70,"D":60}';

				validations.editCourse(req, null);
			});
		});
	});

	describe('Create Course', function () {
		const createRequest = () => ({
			body: {
				course: {
					name: 'ECEN 482',
					semester: '2019S',
					credits: 3,
					cutoffs: '{"A":90,"B":80,"C":70,"D":60}'
				},
				categories: [
					{name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null},
					{name: 'Expanded', weight: 60, position: 200, numGrades: 3, dropped: 1}
				]
			}, params: {id: '5dc10582a8109cd864bd8a13'}, user: {id: '5dc1069b2ff198252ca3b596'}
		});

		describe('Only allows valid number of categories', function () {
			it('Too many categories fails', function () {
				const req = createRequest();
				req.body.categories = [];

				for (let i = 0; i < 15; i++) {
					req.body.categories.push({name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null});
				}

				const stub = sinon.stub(settings, 'get').returns(10);

				try {
					validations.createCourse(req, null);
					expectError();
				} catch (error) {
					expect(error.message).to.include('too many categories');
					stub.restore();
				}
			});

			it('Reasonable number of categories passes', function () {
				const req = createRequest();
				req.body.categories = [];

				for (let i = 0; i < 5; i++) {
					req.body.categories.push({name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null});
				}

				const stub = sinon.stub(settings, 'get').returns(10);

				validations.createCourse(req, null);
				stub.restore();
			});

			it('No categories passes', function () {
				const req = createRequest();
				req.body.categories = [];

				const stub = sinon.stub(settings, 'get').returns(10);

				validations.createCourse(req, null);
				stub.restore();
			});
		});

		describe('Only allows valid number of grades', function () {
			it('Too many grades fails', function () {
				const req = createRequest();
				req.body.categories[0] = {name: 'Single', weight: 40, position: 100, numGrades: 50, dropped: null};

				const stub = sinon.stub(settings, 'get').returns(40);

				try {
					validations.createCourse(req, null);
					expectError();
				} catch (error) {
					expect(error.message).to.include('too many grades');
					stub.restore();
				}
			});

			it('Reasonable number of grades passes', function () {
				const req = createRequest();
				req.body.categories[0] = {name: 'Single', weight: 40, position: 100, numGrades: 10, dropped: null};

				const stub = sinon.stub(settings, 'get').returns(40);

				validations.createCourse(req, null);
				stub.restore();
			});
		});
	});
});
