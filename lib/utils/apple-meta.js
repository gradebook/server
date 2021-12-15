const config = require('../config');

// @ts-check
const cdn = config.get('cdnRoot');
const APPLE_SPECIFIC_META_TAGS = `
	<meta name="apple-touch-fullscreen" content="yes" />
	<meta name="apple-mobile-web-app-title" content="Gradebook" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-iphone.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-iphone-plus.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-iphone-x.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-iphone-xr.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-iphone-max.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-iphone-12.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-iphone-12max.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-sm.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-sm-horiz.png" media="(device-width: 1024px) and (device-height: 768px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-md.png" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-md-horiz.png" media="(device-width: 1080px) and (device-height: 810px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-lg.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-lg-horiz.png" media="(device-width: 1112px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-xl.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-xl-horiz.png" media="(device-width: 1194px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-2xl.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="${cdn}apple-splash-ipad-2xl-horiz.png" media="(device-width: 1366px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />`;

/**
* @param {Gradebook.Request} request
* @returns string
*/
module.exports = request => {
	const ua = request.headers['user-agent'];
	return ua?.match(/ipad|iphone|ipod|mac/i) ? APPLE_SPECIFIC_META_TAGS : '';
};
