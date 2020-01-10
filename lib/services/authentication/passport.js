// @ts-check
const {URL} = require('url');
const passport = require('passport');
const Strategy = require('passport-google-oauth20');
const config = require('../../config');
const api = require('../../api');
const {user: {response: User}} = require('../../models');
const {NotFoundError} = require('../../errors');

async function handleProfile(req, _, __, profile, callback) {
	let user = null;

	try {
		user = await api.user.readGid(profile.id, req._table);
	} catch (error) {
		if (!(error instanceof NotFoundError)) {
			throw error;
		}
	}

	if (user) {
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
		settings: '{"tour":false}'
	};

	callback(null, {});
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
		addStrategy();
		passport.serializeUser((req, profile, cb) => {
			if (!profile.id) {
				return cb(null, `gid:${profile.gid}`);
			}

			cb(null, `${req._table}:${profile.id}`);
		});

		// @todo: Make this work normally
		// The issue I'm running into is in the case of users that have not created their account.
		// We don't have an id to use as the deserialization token, so we use the next best thing
		// (gid). However, gid isn't indexed in the database so performance will be notably worse.
		// There's a high probability that this user will be logged in indefinitely, meaning every
		// one of those requests will use an index-free search. We need to determine if passport
		// supports updating the user serialization token that's not really hacky.
		passport.deserializeUser(async (req, _id, cb) => {
			let apiRequest;
			// @NOTE: don't worry about bson object-id collisions between schools because fuck it
			const id = _id.includes(':') >= 0 ? _id.split(':').pop() : _id;

			if (_id.startsWith('gid:')) {
				if (req.session.userProfile) {
					return cb(null, {});
				}

				apiRequest = api.user.readGid(id, req._table);
			} else {
				apiRequest = api.user.read(id, req._table);
			}

			try {
				const user = await apiRequest;
				cb(null, user);
			} catch (error) {
				// CASE: user deleted their account
				if (error instanceof NotFoundError) {
					return cb(null, null);
				}

				cb(error);
			}
		});
	}
};
