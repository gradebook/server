// @ts-check
const api = require('../api');
const errors = require('../errors');

module.exports = {
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async browse(request, response) {
		const {id: userID} = request.user;
		const {course, category} = request.query;
		const queryOptions = {userID};

		if (course && category) {
			throw new errors.ValidationError({message: 'cannot filter by course AND category'});
		} else if (course) {
			queryOptions.course = course;
		} else if (category) {
			queryOptions.category = category;
		}

		const grades = await api.grade.browse(queryOptions, request._table);
		response.context = {
			statusCode: Array.isArray(grades) ? 200 : 500,
			body: grades
		};
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async create(request, response) {
		const {name, grade} = request.body;
		const {user, category, course} = request.permissions;

		const newGrade = await api.grade.create(
			// eslint-disable-next-line camelcase
			{user_id: user, course_id: course, category_id: category, grade, name},
			null,
			request._table
		);

		response.context = {
			statusCode: newGrade.error ? 500 : 201,
			body: newGrade
		};
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	read(request, response) {
		response.context = {
			body: request.queriedData.json
		};
	},
	// @todo: disallow grade->category / category->grade conversion
	// This should be as simple as adding isNull or isNotNull conditions
	// to the API layer
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async edit(request, response) {
		const {id} = request.params;
		const {queriedData: gradeObject} = request;
		const updatedData = {};

		if ('name' in request.body) {
			if (gradeObject.get('name') === null) {
				throw new errors.BadRequestError({message: 'cannot set name of category'});
			}

			updatedData.name = request.body.name;
		}

		if ('grade' in request.body) {
			updatedData.grade = request.body.grade;
		}

		const apiResponse = await api.grade.update(id, gradeObject, updatedData, null, request._table);
		response.context = {
			body: apiResponse
		};
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async delete(request, response) {
		const {objectId: id} = request.permissions;
		const result = await api.grade.delete(id, null, request._table);
		response.context = {
			statusCode: result ? 204 : 500
		};
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async batchEdit(request, response) {
		const txn = await api.getTransaction();
		const created = [];
		const updated = [];

		try {
			const {queriedData: {course, gradeMap}} = request;
			const {id: category} = request.params;

			if (request.permissions.update.length > 0) {
				for (const toUpdate of request.permissions.update) {
					const {id} = toUpdate;
					const model = gradeMap[id];
					delete toUpdate.id;

					// eslint-disable-next-line no-await-in-loop
					const diff = await api.grade.update(id, model, toUpdate, txn, request._table);
					updated.push(diff);
				}
			}

			if (request.permissions.delete.length > 0) {
				await api.grade.deleteMultiple(request.permissions.delete, txn, request._table);
			}

			if (request.permissions.create.length > 0) {
				for (const toCreate of request.permissions.create) {
					/* eslint-disable camelcase */
					toCreate.category_id = category;
					toCreate.course_id = course;
					toCreate.user_id = request.user.id;
					/* eslint-enable camelcase */
					// eslint-disable-next-line no-await-in-loop
					const createdGrade = await api.grade.create(toCreate, txn, request._table);
					created.push(createdGrade);
				}
			}

			await txn.commit();
			response.context = {
				body: {created, updated}
			};
		} catch (error) {
			await txn.rollback();
			throw new errors.InternalServerError({err: error});
		}
	}
};
