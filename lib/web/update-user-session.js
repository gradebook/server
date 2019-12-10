const {user: {response: UserModel}} = require('../models');
const logging = require('../logging');
const {InternalServerError} = require('../errors');

module.exports.mount = app => {
	app.use(function updateUserSessionIfNeeded(req, res, next) {
		if (!('keepalive' in req.query) && !req.path.startsWith('/api')) {
			return next();
		}


		const updateSession = async () => {
			res.removeListener('finish', updateSession);
			res.removeListener('close', updateSession);

			// CASE: Request didn't deserialize the user
			if (!req.user) {
				return;
			}

			const user = new UserModel(Object.assign({}, req.user));

			try {
				await user.commit();
			} catch (error) {
				logging.error(new InternalServerError({err: error}));
			}
		};

		res.on('finish', updateSession);
		res.on('close', updateSession);
		next();
	});
};
