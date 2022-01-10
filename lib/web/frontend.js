// @ts-check
const {middleware: {hostMatching, noCache}, authentication, home} = require('../controllers');

/**
 * @param {import('express').Application} app
 */
module.exports.mount = app => {
	app.use('/my', hostMatching, authentication.withUser, noCache, home.app);
};
