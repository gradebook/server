// @ts-check
const semesterService = require('../services/current-semester');
const api = require('../api');

// @todo(4.0) create gp-serializer
const sanitizeCourse = require('../services/serializers/course');
const sanitizeCategory = require('../services/serializers/category');
const sanitizeGrade = require('../services/serializers/grade');

module.exports = {
	/**
	* @param {import('../../global').Request} request
	* @param {import('express').Response} response
	*/
	async browse(request, response) {
		const {id: user} = request.user;
		const {validSemesters} = semesterService;

		// STEP 1: Get courses
		const courses = await api.course.browse({user}, request._table);
		if (!Array.isArray(courses)) {
			return response.status(500).json(courses);
		}

		const courseIds = [];

		for (const course of courses) {
			if (validSemesters.includes(course.semester)) {
				courseIds.push(course.id);
			}

			sanitizeCourse(course);
		}

		// STEP 2: Get categories
		const categories = await api.category.browse({
			semesters: validSemesters,
			user
		}, request._table);

		if (!Array.isArray(categories)) {
			return response.status(500).json(categories);
		}

		const catMap = {};

		for (const category of categories) {
			sanitizeCategory(category);
			category.grades = [];
			catMap[category.id] = category;
		}

		// STEP 3: Fetch all grades used by courses. We query by courses here since there's a much lower
		// range of data (e.g. 1-7 vs 1-250)
		const grades = courseIds.length > 0 ? await api.grade.browse({inCourse: courseIds}, request._table) : [];
		grades.forEach(grade => {
			catMap[grade.category].grades.push(sanitizeGrade(grade));
		});

		response.status(200).json({categories, courses});
	},
	/**
	* @param {import('../../global').Request} request
	* @param {import('express').Response} response
	*/
	async browseSlim(request, response) {
		const {id: user} = request.user;
		const {validSemesters} = semesterService;

		const semesters = await api.course.browseSemesters(user, request._table);

		// STEP 1: Get courses
		const courses = await api.course.browse({user, semesters: validSemesters}, request._table);
		if (!Array.isArray(courses)) {
			return response.status(500).json(courses);
		}

		const courseIds = [];
		for (const course of courses) {
			sanitizeCourse(course);
			courseIds.push(course.id);
		}

		// STEP 2: Get categories
		const categories = await api.category.browse({courses: courseIds}, request._table);

		if (!Array.isArray(categories)) {
			return response.status(500).json(categories);
		}

		const catMap = {};

		for (const category of categories) {
			sanitizeCategory(category);
			category.grades = [];
			catMap[category.id] = category;
		}

		// STEP 3: Fetch all grades used by courses. We query by courses here since there's a much lower
		// range of data (e.g. 1-7 vs 1-250)
		const grades = courseIds.length > 0 ? await api.grade.browse({inCourse: courseIds}, request._table) : [];
		grades.forEach(grade => {
			catMap[grade.category].grades.push(sanitizeGrade(grade));
		});

		response.status(200).json({semesters, categories, courses});
	}
};
