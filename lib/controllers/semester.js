// @ts-check
const api = require('../api');
const errors = require('../errors');
const semesterIsValid = require('../utils/semester-key-valid');

module.exports = {
	/**
	 * @param {Gradebook.Request<import('../models/database-response'), never, {semester: string}>} request
	 * @param {Gradebook.ResponseWithContext} response
	 */
	async delete(request, response) {
		const {semester} = request.params;
		const {id: user} = request.user;

		if (!semesterIsValid(semester)) {
			throw new errors.ValidationError({message: 'invalid semester'});
		}

		try {
			const deletedObjects = await api.semester.delete({user, semester, db: request._table});

			if (deletedObjects === 0) {
				return response.status(404).end();
			}

			response.context = {
				body: {deletedObjects}
			};
		} catch (error) {
			throw new errors.InternalServerError({err: error});
		}
	}
};
