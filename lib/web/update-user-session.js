// @ts-check
import {dayjs as date} from '@gradebook/time';
import logging from '../logging.js';
import {InternalServerError} from '../errors/index.js';
import {user} from '../models/index.js';
import {mutex} from '../services/mutex.js';

const UserModel = user.UserRow;

export function useUserSessionUpdater(app) {
	app.use(function updateUserSessionIfNeeded(request, response, next) {
		if (!request.path.startsWith('/api') || request.path === '/api/v0/me') {
			return next();
		}

		const updateSession = async () => {
			response.removeListener('finish', updateSession);
			response.removeListener('close', updateSession);

			// CASE: Request didn't deserialize the user
			if (!request.user) {
				return;
			}

			const needsToUpdate = date(request.user.updated_at).diff(date(), 'day');

			// CASE: today - updatedAt (in days) >= 0 (as in updated today or in the future)
			if (needsToUpdate >= 0) {
				return;
			}

			const mutexID = `user:${request.user.id}`;

			if (!mutex.acquire(mutexID)) {
				return;
			}

			const user = new UserModel({...request.user});

			try {
				await user.commit(null, request._table);
			} catch (error) {
				logging.error(new InternalServerError({err: error}));
			} finally {
				mutex.release(mutexID);
			}
		};

		response.on('finish', updateSession);
		response.on('close', updateSession);
		next();
	});
}
