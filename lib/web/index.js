// @ts-check
const express = require('express');
const config = require('../config');

const middlewares = [
	require('./logging'),
	require('./handlebar-locals'),
	require('./update-user-session'),
	require('./app')
];

if (config.get('live reload').toString() === 'true') {
	middlewares.unshift(null);
	middlewares[0] = middlewares[1];
	middlewares[1] = require('./live-reload');
}

module.exports = () => {
	const app = express();
	middlewares.forEach(middleware => middleware.mount(app));

	return app;
};
