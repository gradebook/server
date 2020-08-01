// @ts-check
// Modified version of Ghost's validator
const validator = require('validator').default;
const {ValidationError} = require('../errors');
const schema = require('./schema');

function isEmpty(obj) {
	if (obj === undefined) {
		return true;
	}

	if (Array.isArray(obj)) {
		return obj.length === 0;
	}

	const strVal = toString(obj);
	if (strVal.indexOf('[object ') === 0 && strVal[strVal.length - 1] === ']') {
		return Object.keys(strVal).length === 0;
	}

	return strVal === '';
}

function toString(value) {
	// eslint-disable-next-line eqeqeq
	return (value || value == 0) ? String(value) : '';
}

/**
 * @typedef {object} MinimumViableModel
 * @property {(column: string) => boolean} [changed]
 * @property  {(column: string) => any} get
 * @property  {(column: string, value: any) => void} set
 */

/**
 * Validate model against schema.
 *
 * ## on model update
 * - only validate changed fields
 * - otherwise we could throw errors which the user is out of control
 * - e.g.
 *   - we add a new field without proper validation, release goes out
 *   - we add proper validation for a single field
 * - if you call `user.save()` the default fallback in bookshelf is `options.method=update`.
 * - we set `options.method` explicit for adding resources (because otherwise bookshelf uses `update`)
 *
 * ## on model add
 * - validate everything to catch required fields
 */
// Validation has a couple of edge cases, there are quite a few branches
/* eslint-disable complexity */

// Unfortunately we can't do type overloading with JSDoc
// A new row will never run through the changed validation loop
// @todo(4.0) ensure this is correct behavior
/**
* Validate an existing database row
* @param {string} tableName
* @param {MinimumViableModel} model
* @param {object} options
* @param {'update' | 'insert'} options.method
*/
function validateRow(tableName, model, {method}) {
	const table = schema[tableName];
	const columns = Object.keys(table);
	// @ts-ignore can't overload insertion call
	const notInsertion = method !== 'insert';
	const errors = [];

	for (const column of columns) {
		if (notInsertion && !model.changed(column)) {
			continue;
		}

		const modelValue = model.get(column);
		// String conversion using basic _.toString logic
		const valueAsString = toString(modelValue);

		const {nullable, type, maxLength, validations, oneOf, fallback} = table[column];

		if (modelValue === null && !nullable) {
			errors.push(`${tableName}.${column} cannot be null`);
			continue;
		}

		// Is the value empty, the column not nullable, and no default value provided?
		if (isEmpty(valueAsString) && nullable !== true && fallback === undefined) {
			errors.push(`${tableName}.${column} cannot be empty`);
			continue;
		}

		// Validate boolean columns
		if (type === 'boolean') {
			if (!(validator.isBoolean(valueAsString) || isEmpty(valueAsString))) {
				errors.push(`${tableName}.${column} must be Boolean`);
				continue;
			}

			// CASE: ensure we transform 0|1 to false|true
			if (!isEmpty(valueAsString)) {
				model.set(column, Boolean(modelValue));
			}
		} else if (type === 'integer' && !validator.isInt(valueAsString)) {
			if (valueAsString === '' && validator.isInt(String(fallback))) {
				model.set(column, fallback);
			} else if (valueAsString === '' && nullable) {
				model.set(column, null);
			} else {
				errors.push(`${tableName}.${column} is not an integer`);
				continue;
			}
		} else if (type === 'float' && !validator.isFloat(valueAsString)) {
			if (valueAsString === '' && validator.isFloat(String(fallback))) {
				model.set(column, fallback);
			} else if (valueAsString === '' && nullable) {
				model.set(column, null);
			// FLOAT(8, 2)
			} else if (valueAsString.length > 8) {
				errors.push(`${tableName}.${column} is too large`);
			} else {
				errors.push(`${tableName}.${column} is not a float`);
				continue;
			}
		}

		if (modelValue == null || modelValue == undefined) { // eslint-disable-line eqeqeq, no-eq-null
			continue;
		}

		const max = maxLength === undefined ? validations.maxLength : maxLength;

		// Check length
		if (max && !validator.isLength(valueAsString, {min: 0, max})) {
			errors.push(`${tableName}.${column} exceeds the maxLength of ${maxLength}`);
			continue;
		}

		if (Array.isArray(oneOf) && !oneOf.includes(modelValue)) {
			errors.push(`${tableName}.${column} does not contain an acceptable value`);
			continue;
		}

		// Check validations objects
		if (validations && validations.between) {
			const [min, max] = validations.between;

			if (!(modelValue >= min && modelValue <= max)) {
				errors.push(`Validation between failed on ${tableName}.${column}`);
			}
		}
	}

	if (errors.length > 0) {
		throw new ValidationError({context: errors});
	}
}
/* eslint-enable complexity */

module.exports = {
	validator,
	validateRow
};
