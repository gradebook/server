/**
* @param {Gradebook.Request} request
*/
module.exports = request => {
	const hasSafari = request.headers['user-agent'].includes('Safari');
	const hasChrome = request.headers['user-agent'].includes('Chrom');
	const hasEdge = request.headers['user-agent'].includes('Edg');

	// Special injects for Safari
	if (hasSafari && !hasChrome && !hasEdge) {
		return `
	<meta name="apple-touch-fullscreen" content="yes" />
	<meta name="apple-mobile-web-app-title" content="Gradebook" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-iphone.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-iphone-plus.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-iphone-x.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-iphone-xr.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-iphone-max.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-iphone-12.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-iphone-12max.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-sm.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-sm-horiz.png" media="(device-width: 1024px) and (device-height: 768px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-md.png" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-md-horiz.png" media="(device-width: 1080px) and (device-height: 810px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-lg.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-lg-horiz.png" media="(device-width: 1112px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-xl.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-xl-horiz.png" media="(device-width: 1194px) and (device-height: 834px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-2xl.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
	<link rel="apple-touch-startup-image" href="https://static.gradebook.app/sYbR9JXKTI/apple-splash-ipad-2xl-horiz.png" media="(device-width: 1366px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />`;
	}

	return '';
};
