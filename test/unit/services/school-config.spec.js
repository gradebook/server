// @ts-check
import makeNock from 'nock';
import {expect} from 'chai';
import {SchoolConfigService} from '../../../lib/services/school-config.js';
import {importJson} from '../../../lib/utils/import-json.js';

const ENDPOINT_RESPONSE = await importJson('../../fixtures/school-configuration.json', import.meta.url);

const ENDPOINT_PATH = '/school-configuration.json';

describe('Unit > SchoolConfigurationService', function () {
	/** @type {import('nock').Scope} */
	let nock;
	/** @type {SchoolConfigService} */
	let service;

	before(function () {
		nock = makeNock('http://nock.gbdev.cf');
	});

	beforeEach(function () {
		service = new SchoolConfigService();
	});

	after(function () {
		makeNock.cleanAll();
	});

	it('init populates school and theme database', async function () {
		nock.get(ENDPOINT_PATH).reply(200, ENDPOINT_RESPONSE);
		expect(service.getSchoolConfig('aggie').head).to.not.contain('aggie');

		// .init() will always be called before any requests are allowed in
		// a normal bootup. Since we're testing that init makes an HTTP request
		// and stores the response, we need to clear the cache
		// @ts-ignore
		service._configCache.clear();

		expect(await service.init(), 'Should have successfully loaded config').to.be.true;

		expect(service.getSchoolConfig('aggie').head).to.contain('aggie');
	});

	it('isPartnered', async function () {
		nock.get(ENDPOINT_PATH).reply(200, ENDPOINT_RESPONSE);
		expect(await service.init()).to.be.true;

		expect(service.isPartnered('aggie')).to.be.true;
		expect(service.isPartnered('does-not-exist')).to.be.false;
		expect(service.isPartnered('commodore')).to.be.false;
	});

	it('refresh atomically updates school data', async function () {
		nock.get(ENDPOINT_PATH).times(2).reply(200, ENDPOINT_RESPONSE);
		// @ts-ignore
		const initialSchoolConfig = service._schoolConfigs;
		expect(await service.init()).to.be.true;

		// @ts-ignore
		expect(service._schoolConfigs).to.equal(initialSchoolConfig);

		await service.refresh();

		// @ts-ignore
		expect(service._schoolConfigs, 'Object ref changed (request passed)').to.not.equal(initialSchoolConfig);

		nock.get(ENDPOINT_PATH).reply(404, 'ono');
		// @ts-ignore
		const firstRefreshConfig = service._schoolConfigs;

		await service.refresh();

		// @ts-ignore
		expect(service._schoolConfigs, 'Object ref did not change (request failed)').to.equal(firstRefreshConfig);
	});

	it('config cache is flushed when refreshing', async function () {
		nock.get(ENDPOINT_PATH).reply(200, ENDPOINT_RESPONSE);
		// @ts-ignore
		service._configCache.set('www', 'fake');

		expect(service.getSchoolConfig('www')).to.equal('fake');

		await service.refresh();

		expect(service.getSchoolConfig('www').head).to.include('site-config');
	});

	it('getSchoolConfig pulls from cache or generates markup', async function () {
		nock.get(ENDPOINT_PATH).reply(200, ENDPOINT_RESPONSE);
		expect(await service.init(), 'Should have successfully loaded config').to.be.true;

		// @ts-ignore
		expect(service._configCache.has('aggie')).to.be.false;
		const {head: markup} = service.getSchoolConfig('aggie');

		// @ts-ignore
		expect(service._configCache.has('aggie')).to.be.true;

		expect(markup).to.contain('<meta name="site-config" value="');
		expect(markup).to.contain('--primary');
		expect(markup).to.contain('--hover');
		expect(markup).to.contain('--image');
	});
});
