const root = '../../lib/services/validation';

const {validations} = require(root);
const expectError = require('../utils/expect-error');

describe('Unit > Validation', function () {
	describe('User Settings', function () {
		it('invalid request', function () {
			const req = {body: {}};

			try {
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Invalid request body');
			}
		});

		it('valid key and value', function (done) {
			const req = {
				body: {key: 'tourStep', value: 8}
			};

			validations.userSettings(req, null, done);
		});

		it('invalid key', function (done) {
			const req = {
				body: {key: 'steal', value: 8}
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
				body: {key: 'tourStep', value: 8}
			};

			try {
				req.body.value = 'bad';
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			try {
				req.body.value = 500;
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			try {
				req.body.value = -500;
				validations.userSettings(req, null, expectError);
				expectError();
			} catch (error) {
				expect(error.message).to.equal('Value is not valid');
			}

			done();
		});
	});
});
