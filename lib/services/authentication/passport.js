const {URL} = require('url');
const passport = require('passport');
const Strategy = require('passport-google-oauth20');
const config = require('../../config');
const api = require('../../api');
const {user: {response: User}} = require('../../models');
const {NotFoundError} = require('../../errors');

async function handleProfile(req, _, __, profile, callback) {
	const userID = await api.user.fromGID(profile.id, req.table);
	if (userID) {
		const user = await api.user.read(userID, req._table);
		const instance = new User(user);
		await instance.commit();

		return callback(null, instance.json);
	}

	const {id: gid, emails, displayName, name: {givenName: firstName, familyName: lastName}} = profile;
	let firstNameFallback = displayName.slice(0, displayName.indexOf(' '));
	let lastNameFallback = displayName.slice(displayName.indexOf(' ') + 1);

	if (!firstNameFallback || !lastNameFallback) {
		firstNameFallback = 'Student';
		lastNameFallback = '';
	}

	req.session.userProfile = {
		gid,
		firstName: firstName || firstNameFallback,
		lastName: lastName || lastNameFallback,
		email: emails[0].value,
		isNew: true,
		// https://github.com/tgriesser/knex/issues/2649
		settings: '{"tour": false}'
	};

	callback(null, Object.assign({}, req.session.userProfile));
}

function addStrategy() {
	const clientID = config.get('oauth:id');
	const clientSecret = config.get('oauth:secret');
	// The Google+ API deprecated March 2019 -> use OpenID since we don't require much info
	// passport-google-oauth20 was updated to use Google sign-in. If it stops working, pass this into the constructor
	// const userProfileURL = 'https://openidconnect.googleapis.com/v1/userinfo';

	if (!clientID || !clientSecret) {
		throw new TypeError('Google Oauth Client ID and Secret must be provided');
	}

	const callbackURL = new URL('./authentication/callback', config.get('oauth:callback')).href;

	passport.use(new Strategy({clientID, clientSecret, callbackURL, passReqToCallback: true}, handleProfile));
}

module.exports = {
	init() {
		// @todo
		passport.serializeUser((profile, cb) => {
			if (!profile.id) {
				return cb(null, '_NEW_USER_');
			}

			cb(null, profile.id);
		});
		passport.deserializeUser(async (req, id, cb) => {
			if (id === '_NEW_USER_') {
				if (!req.session.userProfile) {
					return cb(null, null);
				}

				return cb(null, req.session.userProfile);
			}

			try {
				const user = await api.user.read(id, req._table);
				cb(null, user);
			} catch (error) {
				// CASE: user deleted their account
				if (error instanceof NotFoundError) {
					return cb(null, null);
				}

				cb(error);
			}
		});
		addStrategy();
	}
};
