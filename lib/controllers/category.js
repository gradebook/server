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
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
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
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async edit(request, response) {
		const apiResponse = await api.category.update(
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
	* @param {import('../../global').Response} response
	*/
	async delete(request, response) {
		const {id: userID} = request.user;
		const {id: categoryID} = request.params;
		const wasDeleted = await api.category.delete(categoryID, userID, request._table);

		if (wasDeleted) {
			return response.status(204).end();
		}

		log.error(`Failed deleting category ${categoryID} (owned by ${userID})`);
		response.status(500).json({error: 'Unable to delete category'});
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async expand(request, response) {
		const category = request.queriedData;

		const allGrades = await api.category.expand(category, request.permissions.user, request._table);
		const statusCode = allGrades.length === 2 ? 200 : 500;

		response.context = {
			statusCode,
			body: allGrades
		};
	},

	/**
	* @param {import('../../global').Request} request
	* @param {import('../../global').ResponseWithContext} response
	*/
	async contract(request, response) {
		const category = request.queriedData;
		const {grade} = request.body;

		const id = await api.category.contract(category.id, grade, request._table);

		response.context = {
			body: {
				id,
				grade,
				name: null
			}
		};
	}
};
