// @ts-check
import got from 'got';
import {expect} from 'chai';
import sinon from 'sinon';
import * as testUtils from '../../utils/index.js';
import config from '../../../lib/config.js';
import {clearCache, clearCacheIfNeeded} from '../../../lib/utils/clear-cloudflare-cache.js';
import log from '../../../lib/logging.js';

describe('Unit > Utils > ClearCloudflareCache', function () {
	let gotStub;

	beforeEach(function () {
		gotStub = sinon.stub(got, 'post').resolves({body: '{"success": true}'});
	});

	afterEach(function () {
		sinon.restore();
	});

	describe('clearCache', function () {
		it('Sends request to proper endpoint with proper data', async function () {
			const body = '{"files":["url"]}';
			const headers = {
				'content-type': 'application/json',
				authorization: 'Bearer token',
			};

			await clearCache('zone', 'token', ['url']);

			expect(gotStub.calledOnce).to.be.true;
			expect(gotStub.args[0][0]).to.equal('https://api.cloudflare.com/client/v4/zones/zone/purge_cache');
			expect(gotStub.args[0][1]).to.deep.equal({headers, body});
		});

		it('Gracefully handles HTTP errors', async function () {
			const errorToThrow = new Error('GOT');
			errorToThrow.name = 'HTTPError';
			// @ts-expect-error
			errorToThrow.body = '{"fromTest": true}';
			gotStub.rejects(errorToThrow);

			const response = await clearCache('zone', 'token', ['url']);

			expect(gotStub.calledOnce).to.be.true;
			expect(response.fromTest).to.be.true;
		});

		it('Cannot handle other errors', async function () {
			const errorToThrow = new Error('ECONNRESET');
			// @ts-expect-error
			errorToThrow.fromTest = true;
			gotStub.rejects(errorToThrow);

			try {
				await clearCache('zone', 'token', ['url']);
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
			logErrorStub = sinon.stub(log, 'error');
			logInfoStub = sinon.stub(log, 'info');
		});

		it('skips when config disallows', async function () {
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(false);
			await clearCacheIfNeeded();
			expect(gotStub.called).to.be.false;
		});

		it('handles success well', async function () {
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(true);
			await clearCacheIfNeeded();
			expect(gotStub.calledOnce).to.be.true;
			expect(logInfoStub.calledOnce).to.be.true;
			expect(logInfoStub.args[0][0]).to.match(/success/i);
		});

		it('handles rejection well', async function () {
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(true);
			const error = new Error('FAIL');
			gotStub.rejects(error);

			await clearCacheIfNeeded();
			expect(logErrorStub.calledTwice).to.be.true;
			expect(logErrorStub.args[0][0]).to.match(/failed clearing/i);
			expect(logErrorStub.args[1][0]).to.equal(error);
		});

		it('handles mixed signals', async function () {
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(true);
			const response = {body: '{"success": false}'};
			gotStub.resolves(response);

			await clearCacheIfNeeded();
			expect(logErrorStub.calledOnce).to.be.true;
		});

		it('purges all hosts', async function () {
			/** @type {typeof import('../../../lib/services/host.js')['hostMap']} */
			const hostMap = new Map();

			const originalHostService = Array.from(Object.entries(hostMap));
			sinon.stub(config, 'get').withArgs('cloudflare:enabled').returns(true);

			hostMap.clear();
			hostMap.set('a.gradebook.app', 'a');
			hostMap.set('b.gradebook.app', 'b');
			hostMap.set('c.gradebook.app', 'c');

			try {
				await clearCacheIfNeeded(hostMap);
				expect(gotStub.calledOnce).to.be.true;
				expect(gotStub.args[0][1].body).to.deep.equal(JSON.stringify({
					files: [
						'https://a.gradebook.app/api/v0/version',
						'https://b.gradebook.app/api/v0/version',
						'https://c.gradebook.app/api/v0/version',
					],
				}));
			} finally {
				hostMap.clear();
				for (const [key, value] of originalHostService) {
					hostMap.set(key, value);
				}
			}
		});
	});
});
