const KnexStore = require('brute-knex');
const RedisStore = require('@gradebook/express-brute-redis');

const MODULE = require.resolve('../../../lib/utils/get-limiter-store.js');
const config = require('../../../lib/config');

const getClean = () => {
	delete require.cache[MODULE];
	return require(MODULE);
};

describe('Unit > Utils > GetLimiterStore', function () {
	let stub;

	beforeEach(function () {
		stub = sinon.stub(config, 'get');
	});

	afterEach(function () {
		sinon.restore();
	});

	it('Redis (env)', function () {
		stub.returns('true');
		expect(getClean()).to.be.instanceOf(RedisStore);
	});

	it('Redis (config)', function () {
		stub.returns(true);
		expect(getClean()).to.be.instanceOf(RedisStore);
	});

	it('MySQL (env)', function () {
		stub.returns('false');
		expect(getClean()).to.be.instanceOf(KnexStore);
	});

	it('MySQL (config)', function () {
		stub.returns(false);
		expect(getClean()).to.be.instanceOf(KnexStore);
	});
});
