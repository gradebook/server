// @ts-check
const express = require('express');

const middlewares = [
	require('./logging'),
	require('../development'),
	require('./handlebar-locals'),
	require('./update-user-session'),
	require('./app'),
];

module.exports = () => {
	const app = express();

	middlewares.forEach(middleware => middleware.mount(app)); // eslint-disable-line unicorn/no-array-for-each

	return app;
};
