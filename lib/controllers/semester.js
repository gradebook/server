// @ts-check
import * as api from '../api/index.js';
import * as errors from '../errors/index.js';
import {isSemester} from '../utils/semester-key-valid.js';

export const controller = {
	/**
	 * @param {Gradebook.Request<import('../models/database-response'), never, {semester: string}>} request
	 * @param {Gradebook.ResponseWithContext} response
	 */
	async delete(request, response) {
		const {semester} = request.params;
		const {id: user} = request.user;

		if (!isSemester(semester)) {
			throw new errors.ValidationError({message: `Semester "${semester}" is not valid`});
		}

		try {
			const deletedObjects = await api.semester.delete({user, semester, db: request._table});

			if (deletedObjects === 0) {
				response.status(404).end();
				return response;
			}

			response.context = {
				statusCode: 204,
			};
		} catch (error) {
			throw new errors.InternalServerError({err: error});
		}
	},
};
