const settings = require('../../services/settings');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function checkForRequiredKeys(req, _) {
	ajv.validateSchemeOrDie('course.import', req.body);

	// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
	let parsedCutoffs = {};
	try {
		parsedCutoffs = JSON.parse(req.body.course.cutoffs);
	} catch (error) {
		throw new errors.ValidationError({context: 'cutoffs are not valid JSON'});
	}

	// Validate cutoffs separately from the rest of the course since they had to be parsed first
	ajv.validateSchemeOrDie('course.cutoffs', parsedCutoffs);

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
};
