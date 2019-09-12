const passport = require('passport');

const passportOutgoing = passport.authenticate('google', {scope: ['profile', 'email']});

module.exports = (req, res) => {
	if ('gb-login' in req.query) {
		req.session.redirect = '/assets/logged-in.html';
	}

	passportOutgoing(req, res);
};
