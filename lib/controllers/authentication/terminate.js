// @ts-check
import config from '../../config.js';

const COOKIE_DOMAIN = config.get('domain') || undefined;

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} response
 */
export const terminate = (request, response) => {
	request.session.destroy(() => {
		response.clearCookie('gbardr', {domain: COOKIE_DOMAIN});
		response.status(204).end();
	});
};

export default terminate;
