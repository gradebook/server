// @ts-check
const api = require('../api');
const log = require('../logging');

module.exports = {
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async browse(request, response) {
		const queryOptions = {user: request.user.id, ...request.query};

		const courses = await api.course.browse(queryOptions, request._table);
		response.context = {
			statusCode: Array.isArray(courses) ? 200 : 500,
			body: courses,
		};
	},
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async create(request, response) {
		const returnedImport = await api.course.create({
			user: request.user.id,
			course: request.body.course,
			categories: request.body.categories,
		}, request._table);

		response.context = {
			statusCode: returnedImport.error ? 500 : 201,
			body: returnedImport,
		};
	},
	/**
	 * @param {Gradebook.Request} request
	 * @param {Gradebook.ResponseWithContext} response
	 */
	async completeCreate(request, response) {
		const apiResponse = await api.course.completeCreate({
			user: request.user.id,
			course: request.params.id,
			categories: request.body.categories,
		}, request._table);

		response.context = {
			statusCode: apiResponse.error ? 500 : 200,
			body: apiResponse,
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
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async edit(request, response) {
		const apiResponse = await api.course.update({
			model: request.queriedData,
			data: request.body,
			db: request._table,
		});

		response.context = {
			body: apiResponse,
		};
	},
	/**
	* @param {Gradebook.Request<import('../models/database-response'), never, {id: string}>} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async delete(request, response) {
		const {id: course} = request.params;
		const {id: user} = request.user;
		const wasDeleted = await api.course.delete({id: course, db: request._table}, user);

		const context = {};

		if (wasDeleted) {
			context.statusCode = 204;
		} else {
			log.error(`Failed deleting course ${course} (owned by ${user})`);
			context.statusCode = 500;
			context.body = {error: 'Failed deleting course'};
		}

		response.context = context;
	},
	/**
	* @param {Gradebook.Request<import('../models/database-response'), never, never, never, {value: any}, {key: string}>} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async settings(request, response) {
		const course = request.queriedData;
		const {key} = request.query;
		const {value} = request.body;
		const currentSettings = course.get('settings');
		const parsedSettings = JSON.parse(currentSettings);
		if (parsedSettings[key] === value) {
			response.context = {
				body: {[key]: value},
			};

			return;
		}

		parsedSettings[key] = value;
		course.set('settings', JSON.stringify(parsedSettings));
		await api.course.update({
			model: request.queriedData,
			db: request._table,
			data: {
				settings: JSON.stringify(parsedSettings),
			},
		});

		response.context = {
			body: {[key]: value},
		};
	},
};
