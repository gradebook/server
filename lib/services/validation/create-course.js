const settings = require('../settings');
const errors = require('../../errors');
const ajv = require('./schema-validator');

const context = 'Validate course create';

module.exports = function checkForRequiredKeys(request, _) {
	ajv.validateSchemeOrDie('course.create', request.body);

	if (request.query.type === 'partial') {
		// CASE: The course is declared to be partial and must have an empty cutoffs object.
		if (request.body.course.cutoffs !== '{}') {
			throw new errors.ValidationError({
				context,
				message: 'partial courses must have empty cutoffs object',
			});
		}
	} else if (request.query.type === 'guided' || request.query.type === 'import' || request.query.type === undefined) {
		// CASE: Courses that do not include a query.type are treated as guided, the strictest schema.
		let parsedCutoffs = {};
		// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
		try {
			parsedCutoffs = JSON.parse(request.body.course.cutoffs);
		} catch {
			throw new errors.ValidationError({
				context,
				message: 'cutoffs are not valid JSON',
			});
		}

		// Validate cutoffs separately from the rest of the course since they had to be parsed first
		ajv.validateSchemeOrDie('course.cutoffs', parsedCutoffs);
	} else {
		// CASE: An invalid query.type was presented.
		throw new errors.ValidationError({
			context,
			message: 'query.type must be `guided`, `partial`, or undefined',
		});
	}

	const maxCategories = settings.get('max_categories_per_course', 10);
	const maxGradesPerCategory = settings.get('max_grades_per_category', 10);

	if (request.body.categories.length > maxCategories) {
		throw new errors.ValidationError({
			context,
			message: `Course has too many categories, max is ${maxCategories}`,
		});
	}

	for (const category of request.body.categories) {
		if (category.numGrades > maxGradesPerCategory) {
			throw new errors.ValidationError({
				context,
				message: `At least one category in course has too many grades, max is ${maxGradesPerCategory}`,
			});
		}
	}

	request.permissions = {
		user: request.user.id,
		semester: request.body.course.semester,
	};
};
