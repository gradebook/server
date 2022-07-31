// @ts-check
import path from 'path';
import {URL} from 'url';
import {createProfileHandler, createUserDeserializer, serializeUser} from '@gradebook/passport-utils';
import passport from 'passport';
import Strategy from 'passport-google-oauth20';
import config from '../../config.js';
import * as api from '../../api/index.js';
import {NotFoundError} from '../../errors/index.js';

const handleNotFoundError = error => {
	if (error instanceof NotFoundError) {
		return null;
	}

	throw error;
};

const handleProfile = createProfileHandler(
	(gid, table) => api.user.readGid(gid, table).catch(handleNotFoundError),
);

function addStrategy() {
	const clientID = config.get('oauth:id');
	const clientSecret = config.get('oauth:secret');
	// The Google+ API deprecated March 2019 -> use OpenID since we don't require much info
	// passport-google-oauth20 was updated to use Google sign-in. If it stops working, pass this into the constructor
	// const userProfileURL = 'https://openidconnect.googleapis.com/v1/userinfo';

	if (!clientID || !clientSecret) {
		throw new TypeError('Google Oauth Client ID and Secret must be provided');
	}

	const callbackBase = config.get('oauth:callback');
	// The URL constructor doesn't resolve pathnames relative to the base url
	// e.g. new URL('./relative/path', 'https://example.com/basepath').pathname == '/relative/path'
	// So we have to manually construct the pathname based on the configured url
	const absolutePath = path.resolve(new URL(callbackBase).pathname, './authentication/callback');
	const callbackURL = new URL(absolutePath, callbackBase).href;

	passport.use(new Strategy({clientID, clientSecret, callbackURL, passReqToCallback: true}, handleProfile));
}

export function init() {
	addStrategy();
	passport.serializeUser(serializeUser);
	passport.deserializeUser(
		createUserDeserializer(
			(id, db) => api.user.read({id, db}).catch(handleNotFoundError),
			config.get('domain'),
		),
	);
}
