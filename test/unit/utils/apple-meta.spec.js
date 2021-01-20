const appleMeta = require('../../../lib/utils/apple-meta');

const androidChromeUA = 'Mozilla/5.0 (Linux; Android 11; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.93 Mobile Safari/537.36';
const androidFirefoxUA = 'Mozilla/5.0 (Android 11; Mobile; rv:84.0) Gecko/84.0 Firefox/84.0';
const windowsChromeUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
const windowsEdgeUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.141';
const windowsFirefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0';
const safariPhoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
const safariPadUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15';

const requestStub = userAgent => {
	return {headers: {'user-agent': userAgent}};
};

describe('Unit > Utils > Apple Meta', function () {
	it('Safari on iOS shows custom meta', function () {
		expect(appleMeta(requestStub(safariPhoneUA)).length).to.not.be.equal(0);
		expect(appleMeta(requestStub(safariPadUA)).length).to.not.be.equal(0);
	});

	it('Android browsers do not show custom meta', function () {
		expect(appleMeta(requestStub(androidChromeUA)).length).to.be.equal(0);
		expect(appleMeta(requestStub(androidFirefoxUA)).length).to.be.equal(0);
	});

	it('Desktop browsers do not show custom meta', function () {
		expect(appleMeta(requestStub(windowsChromeUA)).length).to.be.equal(0);
		expect(appleMeta(requestStub(windowsEdgeUA)).length).to.be.equal(0);
		expect(appleMeta(requestStub(windowsFirefoxUA)).length).to.be.equal(0);
	});
});
