const {store} = require('../../lib/cache');

let cacheStub;

module.exports = {
	enable() {
		if (!cacheStub) {
			cacheStub = sinon.stub(store, 'get').returns(undefined);
		}
	},
	disable() {
		if (cacheStub) {
			cacheStub.restore();
			cacheStub = false;
		}
	},
};
