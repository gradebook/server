// @ts-check
import passport from 'passport';

const passportOutgoing = passport.authenticate('google', {keepSessionInfo: true, scope: ['profile', 'email']});

export function redirectToGoogle(request, response) {
	if ('gb-login' in request.query) {
		request.session.redirect = '/assets/logged-in.html';
	}

	passportOutgoing(request, response);
}
