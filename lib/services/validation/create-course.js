const settings = require('../settings');
const errors = require('../../errors');
const ajv = require('./schema-validator');

const context = 'Validate course create';

module.exports = function checkForRequiredKeys(req, _) {
	ajv.validateSchemeOrDie('course.create', req.body);

	if (req.query.type === 'partial') {
		// CASE: The course is declared to be partial and must have an empty cutoffs object.
		if (req.body.course.cutoffs !== '{}') {
			throw new errors.ValidationError({
				context,
				message: 'partial courses must have empty cutoffs object'
			});
		}
	} else if (req.query.type === 'guided' || req.query.type === 'import' || req.query.type === undefined) {
		// CASE: Courses that do not include a query.type are treated as guided, the strictest schema.
		let parsedCutoffs = {};
		// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
		try {
			parsedCutoffs = JSON.parse(req.body.course.cutoffs);
		} catch {
			throw new errors.ValidationError({
				context,
				message: 'cutoffs are not valid JSON'
			});
		}

		// Validate cutoffs separately from the rest of the course since they had to be parsed first
		ajv.validateSchemeOrDie('course.cutoffs', parsedCutoffs);
	} else {
		// CASE: An invalid query.type was presented.
		throw new errors.ValidationError({
			context,
			message: 'query.type must be `guided`, `partial`, or undefined'
		});
	}

	const maxCategories = settings.get('max_categories_per_course', 10);
	const maxGradesPerCategory = settings.get('max_grades_per_category', 10);

	if (req.body.categories.length > maxCategories) {
		throw new errors.ValidationError({
			context,
			message: `Course has too many categories, max is ${maxCategories}`
		});
	}

	for (const category of req.body.categories) {
		if (category.numGrades > maxGradesPerCategory) {
			throw new errors.ValidationError({
				context,
				message: `At least one category in course has too many grades, max is ${maxGradesPerCategory}`
			});
		}
	}

	req.permissions = {
		user: req.user.id,
		semester: req.body.course.semester
	};
};
