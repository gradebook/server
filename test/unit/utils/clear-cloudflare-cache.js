const rewire = require('rewire');
const cache = rewire('../../../lib/utils/clear-cloudflare-cache.js');
const config = require('../../../lib/config');

describe('Unit > Utils > ClearCloudflareCache', function () {
	let gotStub;

	beforeEach(function () {
		gotStub = sinon.stub(cache.__get__('got'), 'post').resolves({body: '{"success": true}'});
	});

	afterEach(function () {
		sinon.restore();
	});

	describe('clearCache', function () {
		const clearCache = cache.__get__('clearCache'); // eslint-disable-line mocha/no-setup-in-describe

		it('Sends request to proper endpoint with proper data', async function () {
			const body = '{"files":["url"]}';
			const headers = {
				'content-type': 'application/json',
				authorization: 'Bearer token'
			};

			await clearCache('zone', 'token', 'url');

			expect(gotStub.calledOnce).to.be.true;
			expect(gotStub.args[0][0]).to.equal('https://api.cloudflare.com/client/v4/zones/zone/purge_cache');
			expect(gotStub.args[0][1]).to.deep.equal({headers, body});
		});

		it('Gracefully handles HTTP errors', async function () {
			const errorToThrow = new Error('GOT');
			errorToThrow.name = 'HTTPError';
			errorToThrow.body = '{"fromTest": true}';
			gotStub.rejects(errorToThrow);

			const response = await clearCache('zone', 'token', 'url');

			expect(gotStub.calledOnce).to.be.true;
			expect(response.fromTest).to.be.true;
		});

		it('Cannot handle other errors', async function () {
			const errorToThrow = new Error('ECONNRESET');
			errorToThrow.fromTest = true;
			gotStub.rejects(errorToThrow);

			try {
				await clearCache('zone', 'token', 'url');
				testUtils.expectError();
			} catch (error) {
				expect(error.fromTest).to.be.true;
			}
		});
	});

	describe('clearCacheIfNeeded', function () {
		let logErrorStub;
		let logInfoStub;

		beforeEach(function () {
			logErrorStub = sinon.stub(cache.__get__('log'), 'error');
			logInfoStub = sinon.stub(cache.__get__('log'), 'info');
		});

		it('skips when config disallows', async function () {
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(false);
			await cache();
			expect(gotStub.called).to.be.false;
		});

		it('handles success well', async function () {
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(true);
			await cache();
			expect(gotStub.calledOnce).to.be.true;
			expect(logInfoStub.calledOnce).to.be.true;
			expect(logInfoStub.args[0][0]).to.match(/success/i);
		});

		it('handles rejection well', async function () {
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(true);
			const e = new Error('FAIL');
			gotStub.rejects(e);

			await cache();
			expect(logErrorStub.calledTwice).to.be.true;
			expect(logErrorStub.args[0][0]).to.match(/failed clearing/i);
			expect(logErrorStub.args[1][0]).to.equal(e);
		});

		it('handles mixed signals', async function () {
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(true);
			const response = {body: '{"success": false}'};
			gotStub.resolves(response);

			await cache();
			expect(logErrorStub.calledOnce).to.be.true;
		});
	});
});
