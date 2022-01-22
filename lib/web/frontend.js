// @ts-check
import {
	noCache,
	hostMatching,
	authentication,
	home,
} from '../controllers/index.js';

/**
 * @param {import('express').Application} app
 */
export function useFrontend(app) {
	app.use('/my', hostMatching, authentication.withUser, noCache, home.app);
}
