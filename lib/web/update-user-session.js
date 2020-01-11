// @ts-check
const date = require('dayjs');
const {user: {response: UserModel}} = require('../models');
const logging = require('../logging');
const {InternalServerError} = require('../errors');
const mutex = require('../services/mutex');

module.exports.mount = app => {
	app.use(function updateUserSessionIfNeeded(req, res, next) {
		if (!req.path.startsWith('/api') || req.path === '/api/v0/me') {
			return next();
		}

		const updateSession = async () => {
			res.removeListener('finish', updateSession);
			res.removeListener('close', updateSession);

			// CASE: Request didn't deserialize the user
			if (!req.user) {
				return;
			}

			const needsToUpdate = date(req.user.updated_at).diff(date(), 'day');

			// CASE: today - updatedAt (in days) >= 0 (as in updated today or in the future)
			if (needsToUpdate >= 0) {
				return;
			}

			const mutexID = `user:${req.user.id}`;

			if (!mutex.acquire(mutexID)) {
				return;
			}

			const user = new UserModel(Object.assign({}, req.user));

			try {
				await user.commit(req._table);
			} catch (error) {
				logging.error(new InternalServerError({err: error}));
			} finally {
				mutex.release(mutexID);
			}
		};

		res.on('finish', updateSession);
		res.on('close', updateSession);
		next();
	});
};
