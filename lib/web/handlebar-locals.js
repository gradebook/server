// @ts-check
const isProduction = require('../utils/is-production');
const renderError = require('../frontend/views/error.js');

module.exports.mount = app => {
	app.use(function addLocals(req, res, next) {
		res.locals.development = !isProduction;

		res.prettyError = error => {
			res.locals.error = error;
			res.send(renderError(res.locals));
			res.end();
		};

		next();
	});
};
