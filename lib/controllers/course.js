// @ts-check
const api = require('../api');
const log = require('../logging');

module.exports = {
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async browse(request, response) {
		const queryOptions = {user: request.user.id, ...request.query};

		const courses = await api.course.browse(queryOptions, request._table);
		response.context = {
			statusCode: Array.isArray(courses) ? 200 : 500,
			body: courses
		};
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async create(request, response) {
		const course = await api.course.create({...request.body, user: request.user.id}, null, request._table);
		response.context = {
			statusCode: course.error ? 500 : 201,
			body: course
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
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async edit(request, response) {
		const apiResponse = await api.course.update(
			request.params.id,
			request.queriedData,
			request.body,
			null,
			request._table
		);

		response.context = {
			body: apiResponse
		};
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async delete(request, response) {
		const {id: course} = request.params;
		const {id: user} = request.user;
		const wasDeleted = await api.course.delete(course, user, request._table);

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
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async import(request, response) {
		const returnedImport = await api.course.import({
			user: request.user.id,
			course: request.body.course,
			categories: request.body.categories
		}, null, request._table);

		response.context = {
			statusCode: returnedImport.error ? 500 : 201,
			body: returnedImport
		};
	}
};
