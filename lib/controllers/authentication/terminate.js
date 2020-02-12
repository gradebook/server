const config = require('../../config');

const COOKIE_DOMAIN = config.get('domain') || undefined;

module.exports = (req, res) => {
	req.logout();
	res.clearCookie('gbardr', {domain: COOKIE_DOMAIN});
	res.status(204).end();
};
