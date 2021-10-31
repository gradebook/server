// @ts-check
const express = require('express');
const logging = require('../logging');
const isProduction = require('../utils/is-production');

const middlewares = [
	require('./logging'),
	require('./handlebar-locals'),
	require('./update-user-session'),
	require('./app'),
];

module.exports = () => {
	const app = express();

	if (!isProduction) {
		try {
			middlewares.unshift(null);
			middlewares[0] = middlewares[1];
			middlewares[1] = require('../../dev-utils/loader');
		} catch (error) {
			logging.error(error);
		}
	}

	middlewares.forEach(middleware => middleware.mount(app)); // eslint-disable-line unicorn/no-array-for-each

	return app;
};
