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
 * @param {number} value
 * @param {'integer' | 'tinyint' | 'smallint' | 'mediumint' | 'bigint'} type
 * @param {boolean} unsigned
 * @returns {boolean}
*/
function isValidNumber(value, type, unsigned, validationSpec) {
	let min = 0;
	let max = 0;

	if (Array.isArray(validationSpec)) {
		min = validationSpec[0];
		max = validationSpec[1];
		/* eslint-disable-next-line camelcase */
		return isInt(toString(value), {allow_leading_zeroes: false, min, max});
	}

	if (type === 'integer') {
		if (unsigned) {
			min = 0;
			max = 4294967295;
		} else {
			min = -2147483648;
			max = 2147483647;
		}
	} else if (type === 'tinyint') {
		if (unsigned) {
			min = 0;
			max = 255;
		} else {
			min = -128;
			max = 127;
		}
	} else if (type === 'smallint') {
		if (unsigned) {
			min = 0;
			max = 65535;
		} else {
			min = -32768;
			max = 32767;
		}
	} else if (type === 'mediumint') {
		if (unsigned) {
			min = 0;
			max = 16777215;
		} else {
			min = -8388608;
			max = 8388607;
		}
	} else if (type === 'bigint') {
		if (unsigned) {
			min = 0;
			max = (2 ** 64) - 1;
		} else {
			min = -(2 ** 63);
			max = (2 ** 63) - 1;
		}
	}

	/* eslint-disable-next-line camelcase */
	return isInt(toString(value), {allow_leading_zeroes: false, min, max});
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

		const {nullable, type, maxLength, validations = {}, fallback, unsigned} = table[column];

		if (modelValue === null && !nullable) {
			errors.push(`${name} cannot be null`);
			continue;
		}

		// Is the value empty, the column not nullable, and no default value provided?
		if (isEmpty(valueAsString) && nullable !== true && fallback === undefined) {
			errors.push(`${name} cannot be empty`);
			continue;
		}

		// CASE: null-ish w/ a fallback -> use fallback
		if (valueAsString === '' && fallback !== undefined) {
			model.set(column, fallback);
			continue;
		}

		// CASE: null-ish and the column is nullable -> use null
		if (valueAsString === '' && nullable) {
			model.set(column, null);
			continue;
		}

		// Validate boolean columns
		if (type === 'boolean') {
			// CASE: out of bounds
			if (!isBoolean(valueAsString)) {
				errors.push(`${name} must be Boolean`);
				continue;
			}

			// eslint-disable-next-line eqeqeq
			const coercedValue = !(modelValue == 0 || modelValue === 'false');

			if (coercedValue !== modelValue) {
				model.set(column, coercedValue);
			}
		} else if (type === 'float' && !isFloat(valueAsString)) {
			// @todo(4.0) include validations.between
			// FLOAT(8, 2)
			if (valueAsString.length > 8) {
				errors.push(`${name} is too large`);
			} else {
				errors.push(`${name} is not a float`);
				continue;
			}
		} else if (
			(type === 'integer' || type === 'tinyint' || type === 'smallint' || type === 'mediumint' || type === 'bigint') &&
			!isValidNumber(modelValue, type, unsigned, validations.between)
		) {
			errors.push(`${name} is not within the allowed range`);
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
	}

	if (errors.length > 0) {
		throw new ValidationError({context: errors});
	}
}
/* eslint-enable complexity */

module.exports = {
	validateRow
};
