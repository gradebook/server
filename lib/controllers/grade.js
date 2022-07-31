// @ts-check
import * as api from '../api/index.js';
import * as errors from '../errors/index.js';

/** @typedef {import('../models/database-response').AbstractDatabaseResponse} Model */

export const controller = {
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async browse(request, response) {
		const queryOptions = {user: request.user.id, ...request.query};

		const grades = await api.grade.browse(queryOptions, request._table);
		response.context = {
			statusCode: Array.isArray(grades) ? 200 : 500,
			body: grades,
		};
	},
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async create(request, response) {
		const {name, grade} = request.body;
		const {user, category, course} = request.permissions;

		const newGrade = await api.grade.create({
			data: {user, course, category, grade, name},
			db: request._table,
		});

		response.context = {
			statusCode: newGrade.error ? 500 : 201,
			body: newGrade,
		};
	},
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	read(request, response) {
		response.context = {
			body: request.queriedData.json,
		};
	},
	// @todo: disallow grade->category / category->grade conversion
	// This should be as simple as adding isNull or isNotNull conditions
	// to the API layer
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async edit(request, response) {
		const {queriedData: model} = request;
		const updatedData = {};

		if ('name' in request.body) {
			if (model.get('name') === null) {
				throw new errors.BadRequestError({message: 'cannot set name of category'});
			}

			updatedData.name = request.body.name;
		}

		if ('grade' in request.body) {
			updatedData.grade = request.body.grade;
		}

		const apiResponse = await api.grade.update({model, data: updatedData, db: request._table});
		response.context = {
			body: apiResponse,
		};
	},
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async delete(request, response) {
		const {objectId: id} = request.permissions;
		const result = await api.grade.delete({id, db: request._table});
		response.context = {
			statusCode: result ? 204 : 500,
		};
	},
	/**
	 * @typedef BatchEditData
	 * @property {string} course
	 * @property {{[id: string]: Model}} gradeMap
	 */

	/**
	 * @typedef BatchEditPermissions
	 * @property {object[]} [update]
	 * @property {string[]} [delete]
	 * @property {object[]} [create]
	 */
	/**
	* @param {Gradebook.Request<BatchEditData, BatchEditPermissions, {id: string}>} request
	* @param {Gradebook.ResponseWithContext} response
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
					const diff = await api.grade.update({model, data: toUpdate, txn, db: request._table});
					updated.push(diff);
				}
			}

			if (request.permissions.delete.length > 0) {
				await api.grade.deleteMultiple({ids: request.permissions.delete, txn, db: request._table});
			}

			if (request.permissions.create.length > 0) {
				for (const toCreate of request.permissions.create) {
					toCreate.category = category;
					toCreate.course = course;
					toCreate.user = request.user.id;
					// eslint-disable-next-line no-await-in-loop
					const createdGrade = await api.grade.create({data: toCreate, txn, db: request._table});
					created.push(createdGrade);
				}
			}

			await txn.commit();
			response.context = {
				body: {created, updated},
			};
		} catch (error) {
			await txn.rollback();
			throw new errors.InternalServerError({err: error});
		}
	},
};
