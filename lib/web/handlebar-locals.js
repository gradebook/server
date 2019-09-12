// @ts-check
const renderDefault = require('../frontend/views/default.js');
const renderError = require('../frontend/views/error.js');

module.exports.mount = app => {
	app.use(function addLocals(req, res, next) {
		res.locals.user = req.user;
		res.locals.loggedIn = req.user && req.user.valid;
		res.locals.development = app.get('env').toLowerCase() === 'development';

		res.prettyError = error => {
			res.locals.error = error;
			res.send(renderError(res.locals));
			res.end();
		};

		res.prettyPrint = body => {
			res.send(renderDefault(res.locals, body));
			res.end();
		};

		next();
	});
};
