// @ts-check
const api = require('../api');
const log = require('../logging');
const {course: sanitizeCourse, category: sanitizeCategory} = require('./sanitizers');

module.exports = {
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async browse(request, response) {
		const {id: userID} = request.user;
		const {semester} = request.query;
		const queryOptions = {userID};

		if (semester) {
			queryOptions.semester = semester.toUpperCase();
		}

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
		// eslint-disable-next-line camelcase
		const course = await api.course.create({...request.body, user_id: request.user.id}, null, request._table);
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
		const {id: courseID} = request.params;
		const wasDeleted = await api.course.delete(courseID, request.user.id, request._table);

		if (!wasDeleted) {
			log.error(`Failed deleting course ${courseID} (owned by ${request.user.id})`);
			return response.status(500).json({error: 'Failed deleting course'});
		}

		response.status(204).end();
	},
	async import(req, res) {
		const returnedImport = await api.course.import({
			user: req.user.id,
			course: req.body.course,
			categories: req.body.categories
		}, null, req._table);

		if (returnedImport.error) {
			return res.status(500).json(returnedImport);
		}

		sanitizeCourse(returnedImport.course);
		returnedImport.categories.forEach(sanitizeCategory);

		res.status(201).json(returnedImport);
	}
};
