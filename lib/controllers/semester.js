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
			throw new errors.ValidationError({message: 'invalid semester'});
		}

		try {
			const deletedObjects = await api.semester.delete({user, semester, db: request._table});

			if (deletedObjects === 0) {
				return response.status(404).end();
			}

			response.context = {
				body: {deletedObjects},
			};
		} catch (error) {
			throw new errors.InternalServerError({err: error});
		}
	},
};
