// @ts-check
// Modified version of Ghost's validator
const {isBoolean, isLength, isInt, isFloat} = require('validator').default;
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

// Validation has a couple of edge cases, there are quite a few branches
/* eslint-disable complexity */

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
	const forUpdate = method === 'update';
	const errors = [];

	for (const column of columns) {
		if (forUpdate && !model.changed(column)) {
			continue;
		}

		const modelValue = model.get(column);
		// String conversion using basic _.toString logic
		const valueAsString = toString(modelValue);
		const name = `${tableName}.${column}`;

		const {nullable, type, maxLength, validations, fallback} = table[column];

		if (modelValue === null && !nullable) {
			errors.push(`${name} cannot be null`);
			continue;
		}

		// Is the value empty, the column not nullable, and no default value provided?
		if (isEmpty(valueAsString) && nullable !== true && fallback === undefined) {
			errors.push(`${name} cannot be empty`);
			continue;
		}

		// Validate boolean columns
		if (type === 'boolean') {
			if (!(isBoolean(valueAsString) || isEmpty(valueAsString))) {
				errors.push(`${name} must be Boolean`);
				continue;
			}

			// CASE: ensure we transform 0|1 to false|true
			if (!isEmpty(valueAsString)) {
				model.set(column, Boolean(modelValue));
			}
		} else if (type === 'integer' && !isInt(valueAsString)) {
			if (valueAsString === '' && isInt(String(fallback))) {
				model.set(column, fallback);
			} else if (valueAsString === '' && nullable) {
				model.set(column, null);
			} else {
				errors.push(`${name} is not an integer`);
				continue;
			}
		} else if (type === 'float' && !isFloat(valueAsString)) {
			if (valueAsString === '' && isFloat(String(fallback))) {
				model.set(column, fallback);
			} else if (valueAsString === '' && nullable) {
				model.set(column, null);
			// FLOAT(8, 2)
			} else if (valueAsString.length > 8) {
				errors.push(`${name} is too large`);
			} else {
				errors.push(`${name} is not a float`);
				continue;
			}
		}

		if (modelValue == null || modelValue == undefined) { // eslint-disable-line eqeqeq, no-eq-null
			continue;
		}

		const max = maxLength === undefined ? validations.maxLength : maxLength;

		// Check length
		if (max && !isLength(valueAsString, {min: 0, max})) {
			errors.push(`${name} exceeds the maxLength of ${maxLength}`);
			continue;
		}

		// Check validations objects
		if (validations && validations.between) {
			const [min, max] = validations.between;

			if (!(modelValue >= min && modelValue <= max)) {
				errors.push(`${name} is not between ${min} and ${max}`);
			}
		}
	}

	if (errors.length > 0) {
		throw new ValidationError({context: errors});
	}
}
/* eslint-enable complexity */

module.exports = {
	validateRow
};
