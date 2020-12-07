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
		const course = await api.course.create({
			data: {...request.body, user: request.user.id},
			db: request._table
		});

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
		const apiResponse = await api.course.update({
			model: request.queriedData,
			data: request.body,
			db: request._table
		});

		response.context = {
			body: apiResponse
		};
	},
	/**
	* @param {import('../../global').Request<import('../models/database-response'), never, {id: string}>} request
	* @param {import('../../global').ResponseWithContext} response
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
	* @param {import('../../global').Request<import('../models/database-response'), never, never, never, {value: any}, {key: string}>} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async settings(request, response) {
		const course = request.queriedData;
		const {key} = request.query;
		const {value} = request.body;
		const currentSettings = course.get('settings');
		const parsedSettings = JSON.parse(currentSettings);
		if (parsedSettings[key] === value) {
			response.context = {
				body: {[key]: value}
			};

			return;
		}

		parsedSettings[key] = value;
		course.set('settings', JSON.stringify(parsedSettings));
		await course.commit();

		response.context = {
			body: {[key]: value}
		};
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
