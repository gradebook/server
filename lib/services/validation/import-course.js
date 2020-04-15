const ajv = require('./schema-validator');
const settings = require('../../services/settings');
const errors = require('../../errors');

module.exports = function checkForRequiredKeys(req, _, next) {
	ajv.validateSchemeOrDie('course.import', req.body);

	const maxCategories = settings.get('max_categories_per_course', 10);
	const maxGradesPerCategory = settings.get('max_grades_per_category', 10);

	if (req.body.categories.length > maxCategories) {
		throw new errors.ValidationError({
			context: 'Validate import course template',
			message: `Course has too many categories, max is ${maxCategories}`
		});
	}

	for (const category of req.body.categories) {
		if (category.numGrades > maxGradesPerCategory) {
			throw new errors.ValidationError({
				context: 'Validate import course template',
				message: `At least one category in course has too many grades, max is ${maxGradesPerCategory}`
			});
		}
	}

	req.permissions = {
		user: req.user.id,
		semester: req.body.course.semester
	};

	next();
};
