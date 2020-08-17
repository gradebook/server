// @ts-check

const {expect} = require('chai');
const {response: UserResponse} = require('../../../lib/models/user');
const testUtils = require('../../utils');

describe('Unit > Models > User', function () {
	let exampleUser;
	/** @type {import('../../../lib/models/database-response')} */
	let response;

	beforeEach(function () {
		exampleUser = Object.assign({}, testUtils.fixtures.users[0]);
		response = new UserResponse(exampleUser);
	});

	describe('set', function () {
		it('invalid key', function () {
			response.set('id', 'bad');

			expect(response.get('id')).to.equal(exampleUser.id);
			expect(response.changed('id')).to.be.false;
			expect(response.dirty).to.be.false;

			response.set('uid', 'does-not-exist');
			expect(response.changed('uid')).to.be.false;
			expect(response.dirty).to.be.false;
		});

		it('not changing value', function () {
			response.set('email', exampleUser.email);
			expect(response.changed('email')).to.be.false;
			expect(response.dirty).to.be.false;
		});

		it('reverting value', function () {
			response.set('email', 'testing@example.com');
			expect(response.changed('email')).to.be.true;
			expect(response.dirty).to.be.true;

			response.set('email', exampleUser.email);
			expect(response.changed('email')).to.be.false;
			expect(response.dirty).to.be.false;
		});
	});

	it('get', function () {
		expect(response.get('first_name')).to.equal('Trusted');
		try {
			response.get('fakeColumn');
			testUtils.expectError();
		} catch (error) {
			expect(error.message).to.equal('Key fakeColumn does not exist');
		}
	});

	it('diff', function () {
		response.set('firstName', 'joe');
		response.set('last_name', 'bloggs');
		response.set('email', 'joe.bloggs@example.com');

		expect(response._getChangeSet()).to.deep.equal({
			first_name: 'joe', // eslint-disable-line camelcase
			last_name: 'bloggs', // eslint-disable-line camelcase
			email: 'joe.bloggs@example.com'
		});

		expect(response.diff).to.deep.equal({
			firstName: 'joe',
			lastName: 'bloggs',
			email: 'joe.bloggs@example.com'
		});
	});
});
