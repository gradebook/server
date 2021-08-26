const passport = require('passport');

const passportOutgoing = passport.authenticate('google', {scope: ['profile', 'email']});

module.exports = (request, response) => {
	if ('gb-login' in request.query) {
		request.session.redirect = '/assets/logged-in.html';
	}

	passportOutgoing(request, response);
};
