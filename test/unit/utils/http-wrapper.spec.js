// @ts-check
import {expect} from 'chai';
import sinon from 'sinon';
import * as testUtils from '../../utils/index.js';
import {wrapHttp as wrap} from '../../../lib/utils/http-wrapper.js';

describe('Unit > Utils > HTTP-Wrapper', function () {
	it('Only accepts function', function () {
		const expectError = parameter => {
			try {
				wrap(parameter);
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

		const request = {isRequest: 'yes'};
		const response = {isResponse: 'yes'};

		await call(request, response, testUtils.expectError);

		fn.returns();
		await call(request, response, testUtils.expectError);

		expect(fn.calledTwice).to.be.true;
		expect(fn.calledWithExactly(request, response)).to.be.true;
	});

	it('Handles errors', async function () {
		const error = new Error('oops');
		const fn = sinon.stub().rejects(error);
		const next = sinon.stub();
		const call = wrap(fn);

		const request = {isRequest: 'yes'};
		const response = {isResponse: 'yes'};

		await call(request, response, next);

		fn.throws(error);
		await call(request, response, next);

		expect(next.calledTwice).to.be.true;
		expect(next.calledWithExactly(error)).to.be.true;
	});
});
