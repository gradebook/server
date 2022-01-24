// @ts-check
import {expect} from 'chai';
import {getAppleTags} from '../../../lib/utils/apple-meta.js';

const androidChromeUA = 'Mozilla/5.0 (Linux; Android 11; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.93 Mobile Safari/537.36';
const androidFirefoxUA = 'Mozilla/5.0 (Android 11; Mobile; rv:84.0) Gecko/84.0 Firefox/84.0';
const windowsChromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4385.0 Safari/537.36';
const windowsEdgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 Edg/87.0.664.75';
const windowsFirefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0';
const safariPhoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
const safariPadUA = 'Mozilla/5.0 (iPad; CPU OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1';

const requestStub = userAgent => ({headers: {'user-agent': userAgent}});

describe('Unit > Utils > Apple Meta', function () {
	it('Safari on iOS shows custom meta', function () {
		expect(getAppleTags(requestStub(safariPhoneUA))).to.not.be.empty;
		expect(getAppleTags(requestStub(safariPadUA))).to.not.be.empty;
	});

	it('Android browsers do not show custom meta', function () {
		expect(getAppleTags(requestStub(androidChromeUA))).to.be.empty;
		expect(getAppleTags(requestStub(androidFirefoxUA))).to.be.empty;
	});

	it('Desktop browsers do not show custom meta', function () {
		expect(getAppleTags(requestStub(windowsChromeUA))).to.be.empty;
		expect(getAppleTags(requestStub(windowsEdgeUA))).to.be.empty;
		expect(getAppleTags(requestStub(windowsFirefoxUA))).to.be.empty;
	});

	it('no ua', function () {
		expect(getAppleTags({headers: {}})).to.be.empty;
	});
});
