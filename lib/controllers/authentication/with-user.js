const session = require('express-session');
const passport = require('passport');
const config = require('../../config');
const settings = require('../../services/settings');
const getStore = require('../../utils/get-session-store');

const sessionOptions = {
	name: 'agbsid',
	secret: settings.get('session_secret'),
	saveUninitialized: false,
	resave: false,
	rolling: true,
	cookie: {
		secure: 'auto',
		maxAge: config.get('session length'), // Defaults to ~1 week
		httpOnly: true,
		path: '/',
		domain: config.get('domain')
	},
	store: getStore()
};

const redirectUser = (req, res, next) => {
	if (req._passportRedirect) {
		return res.status(302).redirect(req._passportRedirect);
	}

	next();
};

module.exports = [
	session(sessionOptions),
	passport.initialize(),
	passport.session(),
	redirectUser
];
