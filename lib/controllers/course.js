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
			status: Array.isArray(courses) ? 200 : 500,
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
	read: async (req, res) => {
		res.status(200).json(sanitizeCourse(req.queriedData.json));
	},
	async edit(req, res) {
		const response = await api.course.update(req.params.id, req.queriedData, req.body, null, req._table);
		return res.json(sanitizeCourse(response));
	},
	async delete(req, res) {
		const {id: courseID} = req.params;
		const wasDeleted = await api.course.delete(courseID, req.user.id, req._table);

		if (!wasDeleted) {
			log.error(`Failed deleting course ${courseID} (owned by ${req.user.id})`);
			return res.status(500).json({error: 'Failed deleting course'});
		}

		res.status(204).end();
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
