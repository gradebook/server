const api = require('../api');
const log = require('../logging');
const errors = require('../errors');
const {category: sanitize, grade: sanitizeGrade} = require('./sanitizers');

module.exports = {
	async browse(req, res) {
		const {id: userID} = req.user;
		const {semester, course, includeGrades} = req.query;
		const filters = {userID};

		if (course) {
			if (semester) {
				throw new errors.ValidationError({message: 'filtering by course and semester is not allowed'});
			}

			filters.course = course;
		} else if (semester) {
			filters.semester = semester;
		}

		const categories = await api.category.browse(filters, req._table);

		if (!Array.isArray(categories)) {
			return res.status(500).json(categories);
		}

		categories.forEach(sanitize);

		if (includeGrades === 'true') {
			const catIDs = new Set();
			const catMap = {};
			categories.forEach(category => {
				category.grades = [];
				catMap[category.id] = category;
				catIDs.add(category.id);
			});

			const grades = await api.grade.browse({inCategory: [...catIDs]}, req._table);
			grades.forEach(grade => {
				catMap[grade.category_id].grades.push(sanitizeGrade(grade));
			});
		}

		res.status(200).json(categories);
	},
	async create(req, res) {
		const ALL_PROPERTIES = ['id', 'course_id', 'name', 'weight', 'position', 'user_id', 'course_id', 'grade'];
		const apiData = {
			user_id: req.user.id // eslint-disable-line camelcase
		};

		for (const property of ALL_PROPERTIES) {
			if (property in req.body) {
				apiData[property] = req.body[property];
			}
		}

		// @todo ensure all types are properly validated in validation - I had to add float checking, so make sure there are no missed cases

		// @todo - add hard limits const categoriesInCourse = await api.category.browse({userID, course: courseID});
		const response = await api.category.create(apiData, null, req._table);

		// @todo add error handling
		const status = response ? 201 : 500;

		res.status(status).json(sanitize(response));
	},
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
	async edit(req, res) {
		const response = await api.category.update(req.params.id, req.queriedData, req.body, req._table);
		res.status(200).json(response);
	},
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
	async expand(req, res) {
		const {queriedData: category} = req;

		const allGrades = await api.category.expand(category, req.permissions.user, req._table);
		const status = allGrades.length === 2 ? 200 : 500;

		for (const grade of allGrades) {
			sanitizeGrade(grade);
		}

		res.status(status).json(allGrades);
	}
};
