// @ts-check
const semesterService = require('../services/current-semester');
const api = require('../api');

const {
	category: sanitizeCategory,
	course: sanitizeCourse,
	grade: sanitizeGrade
} = require('./sanitizers');

module.exports = {
	async browse(req, res) {
		const {id: user} = req.user;

		const queryOptions = {userID: user};

		// STEP 1: Get courses
		const courses = await api.course.browse(queryOptions, req._table);
		if (!Array.isArray(courses)) {
			return res.status(500).json(courses);
		}

		const courseIds = [];

		for (const course of courses) {
			courseIds.push(course.id);
			sanitizeCourse(course);
		}

		// STEP 2: Get categories
		const categories = await api.category.browse({
			semester: semesterService.validSemestersArray,
			...queryOptions
		}, req._table);

		if (!Array.isArray(categories)) {
			return res.status(500).json(categories);
		}

		const catMap = {};

		for (const category of categories) {
			sanitizeCategory(category);
			category.grades = [];
			catMap[category.id] = category;
		}

		// STEP 3: Fetch all grades used by courses. We query by courses here since there's a much lower
		// range of data (e.g. 1-7 vs 1-250)
		const grades = courseIds.length > 0 ? await api.grade.browse({inCourse: courseIds}, req._table) : [];
		grades.forEach(grade => {
			catMap[grade.category_id].grades.push(sanitizeGrade(grade));
		});

		res.status(200).json({categories, courses});
	}
};
