const MODULE = require.resolve('../../../lib/utils/get-session-store');
const config = require('../../../lib/config');

const getClean = () => {
	delete require.cache[MODULE];
	return require(MODULE);
}

describe('Unit > Utils > GetSessionStore', function () {
	let stub;

	beforeEach(function () {
		stub = sinon.stub(config, 'get');
	});

	afterEach(function () {
		sinon.restore();
	});

	it('Redis (env)', function () {
		stub.returns('true');
		// @NOTE: Can't use instance checks here since the class is a singleton
		expect(getClean().constructor.name).to.equal('RedisStore');
	});

	it('Redis (config)', function () {
		stub.returns(true);
		expect(getClean().constructor.name).to.equal('RedisStore');
	});

	it('MySQL (env)', function () {
		stub.returns('false');
		expect(getClean().constructor.name).to.equal('KnexStore');
	});

	it('MySQL (config)', function () {
		stub.returns(false);
		expect(getClean().constructor.name).to.equal('KnexStore');
	});
});
