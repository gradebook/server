const passport = require('passport');
const cookieParser = require('cookie-parser');
const config = require('../../config');

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: 'auto',
	domain: config.get('domain')
};

function addRedirectCookie(req, res, next) {
	const userSettings = JSON.parse(req.user.settings);

	if (userSettings && userSettings.redirectFromHome) {
		// Gradebook auto redirect
		// @todo: compute domain
		res.cookie('gbardr', 'dinklemeyer', COOKIE_OPTIONS);
	}

	next();
}

module.exports = [
	passport.authenticate('google'),
	cookieParser(),
	addRedirectCookie
];
