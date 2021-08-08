// @ts-check
const isProduction = require('../utils/is-production');
const renderError = require('../frontend/views/error.js');

module.exports.mount = app => {
	app.use(function addLocals(request, response, next) {
		response.locals.development = !isProduction;

		response.prettyError = error => {
			response.locals.error = error;
			response.send(renderError(response.locals));
			response.end();
		};

		next();
	});
};
