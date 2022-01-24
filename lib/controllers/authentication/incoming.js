import passport from 'passport';
import cookieParser from 'cookie-parser';
import {addRedirectCookie} from '../middleware.js';

export const incomingAuthenticationMiddleware = [
	passport.authenticate('google'),
	cookieParser(),
	addRedirectCookie,
];
