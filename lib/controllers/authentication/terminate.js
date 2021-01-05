// @ts-check
const config = require('../../config');

const COOKIE_DOMAIN = config.get('domain') || undefined;

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} response
 */
module.exports = (request, response) => {
	request.session.destroy(() => {
		response.clearCookie('gbardr', {domain: COOKIE_DOMAIN});
		response.status(204).end();
	});
};
