// @ts-check
const isProduction = require('../utils/is-production');

const assetsFolder = isProduction ? 'https://static.gradebook.app/sYbR9JXKTI' : 'my/assets';

const manifest = {
	name: 'Gradebook',
	short_name: 'Gradebook',
	theme_color: '#5E3B4D',
	background_color: '#5E3B4D',
	display: 'standalone',
	orientation: 'portrait',
	start_url: '/my/dashboard',
	icons: [
		{
			src: assetsFolder + '/app-icon-desktop.webp',
			sizes: '144x144',
			type: 'image/webp'
		},
		{
			src: assetsFolder + '/android-chrome-192.webp',
			sizes: '192x192',
			type: 'image/webp'
		},
		{
			src: assetsFolder + '/android-chrome-maskable-192.webp',
			sizes: '192x192',
			type: 'image/webp',
			purpose: 'maskable'
		},
		{
			src: assetsFolder + '/android-chrome-256.webp',
			sizes: '256x256',
			type: 'image/webp'
		},
		{
			src: assetsFolder + '/android-chrome-maskable-256.webp',
			sizes: '256x256',
			type: 'image/webp',
			purpose: 'maskable'
		},
		{
			src: assetsFolder + '/android-chrome-384.webp',
			sizes: '384x384',
			type: 'image/webp'
		},
		{
			src: assetsFolder + '/android-chrome-maskable-384.webp',
			sizes: '384x384',
			type: 'image/webp',
			purpose: 'maskable'
		},
		{
			src: assetsFolder + '/android-chrome-512.webp',
			sizes: '512x512',
			type: 'image/webp'
		},
		{
			src: assetsFolder + '/android-chrome-maskable-512.webp',
			sizes: '512x512',
			type: 'image/webp',
			purpose: 'maskable'
		},
		{
			src: assetsFolder + '/android-chrome-1024.webp',
			sizes: '1024x1024',
			type: 'image/webp'
		},
		{
			src: assetsFolder + '/android-chrome-maskable-1024.webp',
			sizes: '1024x1024',
			type: 'image/webp',
			purpose: 'maskable'
		}
	]
};

/**
 * @param {import('../../global.d').Request} request
 * @param {import('../../global.d').ResponseWithContext} response
 */
module.exports.getManifest = (request, response) => {
	response.set('Content-Type', 'application/manifest+json');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(JSON.stringify(manifest));
};
