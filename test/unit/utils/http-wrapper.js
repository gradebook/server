const wrap = require('../../../lib/utils/http-wrapper');

describe('Unit > Utils > HTTP-Wrapper', function () {
	it('Only accepts function', function () {
		const expectError = param => {
			try {
				wrap(param);
			} catch (error) {
				expect(error).to.be.instanceOf(TypeError);
			}
		};

		expectError('hello');
		expectError(['a', 'b', 'c']);
		expectError({test: 'yes'});
		expectError(Symbol('a'));
	});

	it('Passes req, res', async function () {
		const fn = sinon.stub().resolves();
		const call = wrap(fn);

		const req = {isRequest: 'yes'};
		const res = {isResponse: 'yes'};

		await call(req, res, testUtils.expectError);

		fn.returns();
		await call(req, res, testUtils.expectError);

		expect(fn.calledTwice).to.be.true;
		expect(fn.calledWithExactly(req, res)).to.be.true;
	});

	it('Handles errors', async function () {
		const err = new Error('oops');
		const fn = sinon.stub().rejects(err);
		const next = sinon.stub();
		const call = wrap(fn);

		const req = {isRequest: 'yes'};
		const res = {isResponse: 'yes'};

		await call(req, res, next);

		fn.throws(err);
		await call(req, res, next);

		expect(next.calledTwice).to.be.true;
		expect(next.calledWithExactly(err)).to.be.true;
	});
});
