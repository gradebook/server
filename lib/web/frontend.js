// @ts-check
const {join} = require('path');
const express = require('express');
const isProduction = require('../utils/is-production');
const {middleware: {hostMatching}, authentication, home} = require('../controllers');

/**
 * @param {import('express').Application} app
 * @param {string} viewRoot
 */
module.exports.mount = (app, viewRoot) => {
	if (isProduction) {
		app.use('/my', hostMatching, authentication.withUser, home.app);
	} else {
		app.use('/assets', express.static(viewRoot));
		// Check if the file exists locally, or forward the request to the frontend
		app.use('/my',
			hostMatching,
			express.static(join(__dirname, '../frontend/client/release')),
			authentication.withUser,
			home.app
		);
	}
};
