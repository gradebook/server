// @ts-check
const api = require('../api');
const log = require('../logging');
const errors = require('../errors');
const {category: sanitize, grade: sanitizeGrade} = require('./sanitizers');

module.exports = {
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async browse(request, response) {
		const {id: userID} = request.user;
		const {semester, course, includeGrades} = request.query;
		const filters = {userID};

		if (course) {
			if (semester) {
				throw new errors.ValidationError({message: 'filtering by course and semester is not allowed'});
			}

			filters.course = course;
		} else if (semester) {
			filters.semester = semester;
		}

		const categories = await api.category.browse(filters, request._table);

		if (!Array.isArray(categories)) {
			response.status(500).json(categories);
			return 'ENDED';
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
				catMap[grade.category_id].grades.push(grade);
			}
		}

		response.context = {
			body: categories
		};
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async create(request, response) {
		// @todo(4.0) remove duplication
		const ALL_PROPERTIES = ['id', 'course_id', 'name', 'weight', 'position', 'course_id', 'grade', 'dropped'];
		const apiData = {
			user_id: request.user.id // eslint-disable-line camelcase
		};

		for (const property of ALL_PROPERTIES) {
			if (property in request.body) {
				apiData[property] = request.body[property];
			}
		}

		// @todo ensure all types are properly validated in validation - I had to add float checking, so make sure there are no missed cases

		const apiResponse = await api.category.create(apiData, null, request._table);

		// @todo add error handling
		const statusCode = apiResponse ? 201 : 500;

		response.context = {
			statusCode,
			body: apiResponse
		};
	},
	/**
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	*/
	async read(req, res) {
		const {id: categoryID} = req.params;
		const {includeCourse, includeGrades} = req.query;

		const category = await api.category.read({id: categoryID, includeCourse: true}, req._table);

		if (includeCourse) {
			delete category.course.userID;
		} else {
			delete category.course;
		}

		if (includeGrades === 'true') {
			const grades = await api.grade.browse({category: categoryID}, req._table);
			category.grades = grades;
		}

		res.status(200).json(category);
	},
	/**
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	*/
	async edit(req, res) {
		const response = await api.category.update(req.params.id, req.queriedData, req.body, null, req._table);
		res.status(200).json(sanitize(response));
	},
	/**
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	*/
	async delete(req, res) {
		const {id: userID} = req.user;
		const {id: categoryID} = req.params;
		const wasDeleted = await api.category.delete(categoryID, userID, req._table);

		if (wasDeleted) {
			return res.status(204).end();
		}

		log.error(`Failed deleting category ${categoryID} (owned by ${userID})`);
		res.status(500).json({error: 'Unable to delete category'});
	},
	/**
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	*/
	async expand(req, res) {
		const {queriedData: category} = req;

		const allGrades = await api.category.expand(category, req.permissions.user, req._table);
		const status = allGrades.length === 2 ? 200 : 500;

		for (const grade of allGrades) {
			sanitizeGrade(grade);
		}

		res.status(status).json(allGrades);
	},

	/**
	* @param {import('../../global').Request} req
	* @param {import('express').Response} res
	*/
	async contract(req, res) {
		const {queriedData: category} = req;
		const {grade} = req.body;

		const id = await api.category.contract(category.id, grade, req._table);

		return res.status(200).json({id, grade, name: null});
	}
};
