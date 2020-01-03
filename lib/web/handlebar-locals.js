// @ts-check
const renderError = require('../frontend/views/error.js');

module.exports.mount = app => {
	const isDevelopment = app.get('env').toLowerCase() === 'development';

	app.use(function addLocals(req, res, next) {
		res.locals.user = req.user;
		res.locals.loggedIn = Boolean(req.user);
		res.locals.development = isDevelopment;

		res.prettyError = error => {
			res.locals.error = error;
			res.send(renderError(res.locals));
			res.end();
		};

		next();
	});
};
