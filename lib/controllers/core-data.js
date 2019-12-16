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
		const courses = await api.course.browse(queryOptions);
		if (!Array.isArray(courses)) {
			return res.status(500).json(courses);
		}

		courses.forEach(sanitizeCourse);

		// STEP 2: Get categories
		const categories = await api.category.browse({semester: ['2019F', '2019W', '2020S'], ...queryOptions});

		if (!Array.isArray(categories)) {
			return res.status(500).json(categories);
		}

		const catIDs = new Set();
		const catMap = {};

		for (const category of categories) {
			sanitizeCategory(category);
			category.grades = [];
			catMap[category.id] = category;
			catIDs.add(category.id);
		}

		// STEP 3: Get grades and add to category
		const grades = await api.grade.browse({inCategory: [...catIDs]});
		grades.forEach(grade => {
			catMap[grade.category_id].grades.push(sanitizeGrade(grade));
		});

		res.status(200).json({categories, courses});
	}
};
