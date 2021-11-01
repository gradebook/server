// @ts-check
const path = require('path');
const express = require('express');
const {middleware: {hostMatching}, authentication, home} = require('../lib/controllers');
const config = require('../lib/config');
const {viewRoot} = require('../lib/web/app');
const delay = require('./delay');

/**
 * @param {import('express').Application} app
 */
module.exports.mount = app => {
	app.use('/assets', express.static(viewRoot));
	// Check if the file exists locally, or forward the request to the frontend
	// Note: we ignore the index because it's handled by `home.app`
	app.use('/my',
		hostMatching,
		express.static(path.join(__dirname, '../lib/frontend/client/release'), {index: false}),
		authentication.withUser,
		home.app,
	);

	if (String(config.get('live reload')) === 'true') {
		require('./live-reload').mount(app);
	}

	app.use(delay);
};
