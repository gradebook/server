// @ts-check
const express = require('express');

const middlewares = [
	require('./logging'),
	require('./handlebar-locals'),
	require('../development'),
	require('./update-user-session'),
	require('./app'),
];

module.exports = () => {
	const app = express();

	middlewares.forEach(middleware => middleware.mount(app)); // eslint-disable-line unicorn/no-array-for-each

	return app;
};
