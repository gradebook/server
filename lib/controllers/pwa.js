// @ts-check
const isProduction = require('../utils/is-production');

const assetsFolder = isProduction ? 'https://static.gradebook.app/sYbR9JXKTI' : 'my/assets';
const favicon = '<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>path { fill: #FFF; } polyline { stroke: #FFF; stroke-width: 4; stroke-linecap: round; } </style><g fill="none" fill-rule="evenodd"><!-- cover --><path d="M97 16 L167 44 L96 83 L23 53 z" /><polyline points="25 54 25 81 96 111 167 71" /><polyline points="25 93 25 113 96 143 167 103" /><polyline points="25 125 25 145 96 175 167 135" /></g></svg>';
const faviconMaskable = '<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>rect { fill: #__MASK_COLOR__; } path { fill: #FFF; } polyline { stroke: #FFF; stroke-width: 4; stroke-linecap: round; } </style><rect width="192" height="192" /><g transform="scale(0.6) translate(64, 64)" fill="none" fill-rule="evenodd"><!-- cover --><path d="M97 16 L167 44 L96 83 L23 53 z" /><polyline points="25 54 25 81 96 111 167 71" /><polyline points="25 93 25 113 96 143 167 103" /><polyline points="25 125 25 145 96 175 167 135" /></g></svg>';

/**
 * @param {import('../../global.d').Request} request
 * @param {import('../../global.d').ResponseWithContext} response
 */
module.exports.getManifest = (request, response) => {
	const themeColor = request.params.color;

	const manifest = {
		name: 'Gradebook',
		short_name: 'Gradebook',
		theme_color: '#' + themeColor,
		background_color: '#' + themeColor,
		display: 'standalone',
		orientation: 'portrait',
		start_url: '/my/dashboard',
		icons: [
			{
				src: 'pwa-icon.svg',
				sizes: '192x192',
				type: 'image/svg+xml',
				purpose: 'any'
			},
			{
				src: 'pwa-icon-maskable-' + themeColor + '.svg',
				sizes: '192x192',
				type: 'image/svg+xml',
				purpose: 'maskable'
			},
			{
				src: assetsFolder + '/android-chrome-192.webp',
				sizes: '192x192',
				type: 'image/webp'
			},
			{
				src: assetsFolder + '/android-chrome-256.webp',
				sizes: '256x256',
				type: 'image/webp'
			},
			{
				src: assetsFolder + '/android-chrome-384.webp',
				sizes: '384x384',
				type: 'image/webp'
			},
			{
				src: assetsFolder + '/android-chrome-512.webp',
				sizes: '512x512',
				type: 'image/webp'
			},
			{
				src: assetsFolder + '/android-chrome-1024.webp',
				sizes: '1024x1024',
				type: 'image/webp'
			},
			{
				src: assetsFolder + '/android-chrome-192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: assetsFolder + '/android-chrome-512.png',
				sizes: '512x512',
				type: 'image/png'
			}
		]
	};

	response.set('Content-Type', 'application/manifest+json');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(JSON.stringify(manifest));
};

/**
 * @param {import('../../global.d').Request} request
 * @param {import('../../global.d').ResponseWithContext} response
 */
module.exports.getFavicon = (request, response) => {
	response.set('Content-Type', 'image/svg+xml');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(favicon);
};

/**
 * @param {import('../../global.d').Request} request
 * @param {import('../../global.d').ResponseWithContext} response
 */
module.exports.getMaskableFavicon = (request, response) => {
	const maskColor = request.params.color;
	const masked = faviconMaskable.replace('__MASK_COLOR__', maskColor);

	response.set('Content-Type', 'image/svg+xml');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(masked);
};
