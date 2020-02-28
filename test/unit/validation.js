const root = '../../lib/services/validation';

const {validations} = require(root);
const expectError = require('../utils/expect-error');

describe('Unit > Validation', function () {
	describe('User Settings', function () {
		it('invalid request', function () {
			const req = {body: {}, query: {}};

			try {
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Invalid request body');
			}
		});

		it('valid key and value', function (done) {
			const req = {
				body: {value: '2020-01-30T22:13:22.000-06:00'},
				query: {key: 'previous_notification'}
			};

			validations.userSettings(req, null, done);
		});

		it('invalid key', function (done) {
			const req = {
				body: {value: 8},
				query: {key: 'steal'}
			};

			try {
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Setting steal does not exist');
				done();
			}
		});

		it('invalid value', function (done) {
			const req = {
				body: {value: '2019-09-09'},
				query: {key: 'previous_notification'}
			};

			try {
				req.body.value = 'bad';
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			try {
				req.body.value = 'not a date';
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			try {
				req.body.value = {};
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			done();
		});
	});

	describe('Edit Category', function () {
		describe('Only allows valid weights', function () {
			const createRequest = () => (
				{body: {}, params: {id: '5dc10582a8109cd864bd8a13'}, user: {id: '5dc1069b2ff198252ca3b596'}}
			);

			it('Lower out of bounds fails', function () {
				const req = createRequest();
				req.body.weight = 0;

				try {
					validations.editCategory(req, null, expectError);
					expectError();
				} catch (error) {
					expect(error.message).to.include('data.weight should be >= 1');
				}
			});

			it('Upper out of bounds fails', function () {
				const req = createRequest();
				req.body.weight = 19248124814;

				try {
					validations.editCategory(req, null, expectError);
					expectError();
				} catch (error) {
					expect(error.message).to.include('data.weight should be <= 10000');
				}
			});

			it('Normal floating points are acceptable', function (done) {
				const req = createRequest();
				req.body.weight = 1234.56;
				validations.editCategory(req, null, done);
			});

			it('Null is acceptable', function (done) {
				const req = createRequest();
				req.body.weight = null;
				validations.editCategory(req, null, done);
			});

			it('Not providing is acceptable', async function () {
				const {promisify} = require('util');
				const editCategoryValidation = promisify(validations.editCategory);
				const req = createRequest();

				req.body.name = 'Name';
				await editCategoryValidation(req, null);
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
					validations.editCourse(req, null, expectError);
					expectError();
				} catch (error) {
					expect(error.message).to.contain('data.name should match pattern');
				}
			});

			it('valid', function (done) {
				const req = createRequest();
				req.body.name = 'DEMO 101';

				validations.editCourse(req, null, done);
			});

			it('neutral', function (done) {
				const req = createRequest();
				req.body.cut1 = 95;

				validations.editCourse(req, null, done);
			});
		});
	});
});
