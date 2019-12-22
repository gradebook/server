const session = require('express-session');
const passport = require('passport');
const config = require('../../config');
const settings = require('../../cache/settings');
const getStore = require('../../utils/get-session-store');

const sessionOptions = {
	name: 'agbsid',
	secret: settings.get('session_secret'),
	saveUninitialized: false,
	resave: false,
	rolling: true,
	cookie: {
		maxAge: config.get('session length'), // Defaults to ~1 week
		httpOnly: true,
		path: '/'
	},
	store: getStore()
};

module.exports = [
	session(sessionOptions),
	passport.initialize(),
	passport.session()
];
