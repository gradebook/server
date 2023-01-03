// @ts-check
import {settings} from '../../settings/index.js';
import * as errors from '../../../errors/index.js';
import {validateSchemeOrDie} from '../schema-validator.js';

export const context = 'Validate course create';

/**
 * @description Ensures that cutoffs are valid json and match the course.cutoffs schema
 * @param {string} cutoffs
 * @returns {void}
 */
export function validateCutoffs(cutoffs) {
	// CASE: Courses that do not include a query.type are treated as guided, the strictest schema.
	let parsedCutoffs = {};
	// If invalid JSON is sent we catch when JSON.parse() fails and throw an error
	try {
		parsedCutoffs = JSON.parse(cutoffs);
	} catch {
		throw new errors.ValidationError({
			context,
			message: 'Failed creating course: cutoffs are malformed',
		});
	}

	// Validate cutoffs separately from the rest of the course since they had to be parsed first
	validateSchemeOrDie('course.cutoffs', parsedCutoffs);
}

export function validateCategoryLimits(categoryList) {
	const maxCategories = settings.get('max_categories_per_course');
	const maxGradesPerCategory = settings.get('max_grades_per_category');

	if (categoryList.length > maxCategories) {
		throw new errors.ValidationError({
			context,
			message: `Failed creating course: number of categories exceeded the maximum of ${maxCategories}`,
		});
	}

	for (const category of categoryList) {
		if (category.numGrades > maxGradesPerCategory) {
			throw new errors.ValidationError({
				context,
				message: `Failed creating course: at least one category has more than the maximum of ${maxGradesPerCategory} grades.`,
			});
		}
	}
}
