// @ts-check
const schoolConfigService = require('../services/school-config');
const renderManifest = require('../frontend/views/manifest');
const renderIcon = require('../frontend/views/pwa-icon');
const renderMaskableIcon = require('../frontend/views//pwa-icon-maskable');

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.ResponseWithContext} response
 */
module.exports.getManifest = (request, response) => {
	const schoolConfig = schoolConfigService.getRawSchoolConfig(request._domain);
	response.set('Content-Type', 'application/manifest+json');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(renderManifest(schoolConfig.theme.primary));
};

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.ResponseWithContext} response
 */
module.exports.getFavicon = (request, response) => {
	response.set('Content-Type', 'image/svg+xml');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(renderIcon());
};

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.ResponseWithContext} response
 */
module.exports.getMaskableFavicon = (request, response) => {
	const schoolConfig = schoolConfigService.getRawSchoolConfig(request._domain);
	response.set('Content-Type', 'image/svg+xml');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(renderMaskableIcon(schoolConfig.theme.primary));
};
