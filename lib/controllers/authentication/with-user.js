const session = require('express-session');
const passport = require('passport');
const KnexSessionStore = require('connect-session-knex')(session);
const config = require('../../config');
const settings = require('../../cache/settings');
const {knex: {instance: knex}} = require('../../database');

const knexSessionOpts = {
	knex,
	createTable: false,
	sidfieldname: 'sessionAGB',
	// Clear expired sessions every week
	clearInterval: 1000 * 60 * 60 * 24 * 7
};

const sessionOptions = {
	name: 'agbsid',
	secret: settings.get('session_secret'),
	saveUninitialized: true,
	resave: false,
	rolling: true,
	cookie: {
		maxAge: config.get('session length'), // Defaults to ~1 week
		httpOnly: true,
		path: '/'
	},
	store: new KnexSessionStore(knexSessionOpts)
};

module.exports = [
	session(sessionOptions),
	passport.initialize(),
	passport.session()
];
