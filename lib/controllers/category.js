// @ts-check
const api = require('../api');
const log = require('../logging');

module.exports = {
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async browse(request, response) {
		// The includeGrades filter doesn't get sent to the API request
		// @todo: we should probably do that
		const {includeGrades} = request.query;
		delete request.query.includeGrades;

		const filters = {user: request.user.id, ...request.query};

		const categories = await api.category.browse(filters, request._table);

		if (!Array.isArray(categories)) {
			return response.status(500).json(categories);
		}

		if (includeGrades === 'true') {
			const catIDs = new Set();
			const catMap = {};
			categories.forEach(category => {
				category.grades = [];
				catMap[category.id] = category;
				catIDs.add(category.id);
			});

			const grades = await api.grade.browse({inCategory: [...catIDs]}, request._table);
			for (const grade of grades) {
				catMap[grade.category].grades.push(grade);
			}
		}

		response.context = {
			body: categories
		};
	},
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async create(request, response) {
		const apiResponse = await api.category.create({data: {...request.body, user: request.user.id}, db: request._table});
		// @todo add error handling
		const statusCode = apiResponse ? 201 : 500;

		response.context = {
			statusCode,
			body: apiResponse
		};
	},
	/**
	* @param {Gradebook.Request<import('../models/database-response'), any, {id: string}>} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async read(request, response) {
		const {includeGrades} = request.query;
		const category = request.queriedData.json;

		if (includeGrades === 'true') {
			const {id: categoryID} = request.params;
			const grades = await api.grade.browse({category: categoryID}, request._table);
			category.grades = grades;
		}

		response.context = {
			body: category
		};
	},
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async edit(request, response) {
		const apiResponse = await api.category.update({
			model: request.queriedData,
			data: request.body,
			db: request._table
		});

		response.context = {
			body: apiResponse
		};
	},
	/**
	* @param {Gradebook.Request<import('../models/database-response'), never, {id: string}>} request
	* @param {Gradebook.Response} response
	*/
	async delete(request, response) {
		const {id: user} = request.user;
		const {id: category} = request.params;
		const wasDeleted = await api.category.delete(category, user, request._table);

		/** @type {Gradebook.ResponseContext} */
		const context = {};

		if (wasDeleted) {
			context.statusCode = 204;
		} else {
			context.statusCode = 500;
			context.body = {error: 'Unable to delete category'};
			log.error(`Failed deleting category ${category} (owned by ${user})`);
		}

		response.context = context;
	}
};
