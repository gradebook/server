// @ts-check
import {semester} from '@gradebook/time';
import * as api from '../api/index.js';

import {serializeCourse as sanitizeCourse} from '../services/serializers/course.js';
import {serializeCategory as sanitizeCategory} from '../services/serializers/category.js';
import {serializeGrade as sanitizeGrade} from '../services/serializers/grade.js';

const semesterService = semester.data;

export const controller = {
	/**
	* @param {Gradebook.Request} request
	* @param {import('express').Response} response
	*/
	async browse(request, response) {
		const {id: user} = request.user;
		const {allowedSemesters} = semesterService;

		// STEP 1: Get courses
		const courses = await api.course.browse({user}, request._table);
		if (!Array.isArray(courses)) {
			return response.status(500).json(courses);
		}

		const courseIds = [];

		for (const course of courses) {
			if (allowedSemesters.includes(course.semester)) {
				courseIds.push(course.id);
			}

			sanitizeCourse(course);
		}

		// STEP 2: Get categories
		const categories = await api.category.browse({
			semesters: allowedSemesters,
			user,
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
		for (const grade of grades) {
			catMap[grade.category].grades.push(sanitizeGrade(grade));
		}

		response.status(200).json({categories, courses});
	},
	/**
	* @param {Gradebook.Request} request
	* @param {import('express').Response} response
	*/
	async browseSlim(request, response) {
		const {id: user} = request.user;
		const {allowedSemesters} = semesterService;

		const semesters = await api.course.browseSemesters(user, request._table);

		// STEP 1: Get courses
		const courses = await api.course.browse({user, semesters: allowedSemesters}, request._table);
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
		for (const grade of grades) {
			catMap[grade.category].grades.push(sanitizeGrade(grade));
		}

		response.status(200).json({semesters, categories, courses});
	},
};
