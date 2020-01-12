// @ts-check
const express = require('express');

const middlewares = [
	require('./logging'),
	require('./handlebar-locals'),
	require('./update-user-session'),
	require('./host-matching'),
	require('./app')
];

module.exports = () => {
	const app = express();
	middlewares.forEach(middleware => middleware.mount(app));

	return app;
};
