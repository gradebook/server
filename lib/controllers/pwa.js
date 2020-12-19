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

/**
 * @param {import('../../global.d').Request} request
 * @param {import('../../global.d').ResponseWithContext} response
 */
module.exports.getManifest = (request, response) => {
	response.set('Content-Type', 'application/manifest+json');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(JSON.stringify(manifest));
};
