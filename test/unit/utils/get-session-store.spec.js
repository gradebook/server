// @ts-check
import {expect} from 'chai';
import sinon from 'sinon';
import config from '../../../lib/config.js';
import {_getStore as getClean} from '../../../lib/utils/get-session-store.js';

describe('Unit > Utils > GetSessionStore', function () {
	let stub;

	beforeEach(function () {
		stub = sinon.stub(config, 'get');
	});

	afterEach(function () {
		sinon.restore();
	});

	it('Redis (env)', async function () {
		stub.returns('true');
		const store = await getClean();
		// @NOTE: Can't use instance checks here since the class is a singleton
		expect(store.constructor.name).to.equal('RedisStore');
	});

	it('Redis (config)', async function () {
		stub.returns(true);
		const store = await getClean();
		expect(store.constructor.name).to.equal('RedisStore');
	});

	it('MySQL (env)', async function () {
		stub.returns('false');
		const store = await getClean();
		expect(store.constructor.name).to.equal('KnexStore');
	});

	it('MySQL (config)', async function () {
		stub.returns(false);
		const store = await getClean();
		expect(store.constructor.name).to.equal('KnexStore');
	});
});
