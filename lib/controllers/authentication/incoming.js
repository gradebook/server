const passport = require('passport');
const cookieParser = require('cookie-parser');
const {addRedirectCookie} = require('../middleware');

module.exports = [
	passport.authenticate('google'),
	cookieParser(),
	addRedirectCookie,
];
