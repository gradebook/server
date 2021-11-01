// @ts-check
const settings = require('../../settings');
const errors = require('../../../errors');
const ajv = require('../schema-validator');

const context = 'Validate course create';

module.exports.context = context;

/**
 * @description Ensures that cutoffs are valid json and match the course.cutoffs schema
 * @param {string} cutoffs
 * @returns {void}
 */
module.exports.validateCutoffs = cutoffs => {
	// CASE: Courses that do not include a query.type are treated as guided, the strictest schema.
	let parsedCutoffs = {};
	// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
	try {
		parsedCutoffs = JSON.parse(cutoffs);
	} catch {
		throw new errors.ValidationError({
			context,
			message: 'cutoffs are not valid JSON',
		});
	}

	// @ts-expect-error
	// Validate cutoffs separately from the rest of the course since they had to be parsed first
	ajv.validateSchemeOrDie('course.cutoffs', parsedCutoffs);
};

module.exports.validateCategoryLimits = categoryList => {
	const maxCategories = settings.get('max_categories_per_course');
	const maxGradesPerCategory = settings.get('max_grades_per_category');

	if (categoryList.length > maxCategories) {
		throw new errors.ValidationError({
			context,
			message: `Course has too many categories, max is ${maxCategories}`,
		});
	}

	for (const category of categoryList) {
		if (category.numGrades > maxGradesPerCategory) {
			throw new errors.ValidationError({
				context,
				message: `At least one category in course has too many grades, max is ${maxGradesPerCategory}`,
			});
		}
	}
};
