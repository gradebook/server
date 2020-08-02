// @ts-check
// Modified version of Ghost's validator
const isBoolean = require('validator/lib/isBoolean').default;
const isLength = require('validator/lib/isLength').default;
const isInt = require('validator/lib/isInt').default;
const isFloat = require('validator/lib/isFloat').default;
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
 * @param {[number, number]} [validationSpec]
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
 * @param {string} value
 * @param {boolean} unsigned
 * @param {[number, number]} [validationSpec]
 * @param {number} [precision] M - D in the schema (e.g. FLOAT(8,2) => 6)
*/
function isValidFloat(value, unsigned, validationSpec, precision = 6) {
	let min = 0;
	let max = Number('9'.repeat(precision) + '.00');

	if (Array.isArray(validationSpec)) {
		min = validationSpec[0];
		max = validationSpec[1];
	} else if (!unsigned) {
		min = max * -1;
	}

	return isFloat(value, {min, max});
}

/**
 * @param {{
	 nullable?: boolean;
	 type: string;
	 maxLength?: number;
	 validations?: object;
	 fallback?: any;
	 unsigned?: boolean;
 }} columnSpec
 * @param {any} value
 * @param {string} context;
 * @returns {[string, any]} [errorMessage, newValue] - errorMessage will be a string
 *          if there was a validation error, or null
 *          newValue will be undefined if there was no change to the initial value,
 *          or it will be the coerced valid value if there was a change
 */
/* eslint-disable-next-line complexity */
function _validateSingleColumn(columnSpec, value, context) {
	// String conversion using basic _.toString logic
	const valueAsString = toString(value);

	const {nullable, type, maxLength, validations = {}, fallback, unsigned} = columnSpec;

	if (value === null && !nullable) {
		return [`${context} cannot be null`, null];
	}

	// Is the value empty, the column not nullable, and no default value provided?
	if (isEmpty(valueAsString) && nullable !== true && fallback === undefined) {
		return [`${context} cannot be empty`, null];
	}

	// CASE: null-ish w/ a fallback -> use fallback
	if (valueAsString === '' && fallback !== undefined) {
		return [null, fallback];
	}

	// CASE: null-ish and the column is nullable -> use null
	if (valueAsString === '' && nullable) {
		return [null, null];
	}

	// Validate boolean columns
	if (type === 'boolean') {
		// CASE: out of bounds
		if (!isBoolean(valueAsString)) {
			return [`${context} must be Boolean`, null];
		}

		// eslint-disable-next-line eqeqeq
		const coercedValue = !(value == 0 || value === 'false');

		if (coercedValue !== value) {
			return [null, coercedValue];
		}
	} else if (type === 'float' && !isValidFloat(valueAsString, unsigned, validations.between)) {
		return [`${context} is not within the allowed range`, null];
	} else if (
		(type === 'integer' || type === 'tinyint' || type === 'smallint' || type === 'mediumint' || type === 'bigint') &&
		!isValidNumber(value, type, unsigned, validations.between)
	) {
		return [`${context} is not within the allowed range`, null];
	} else if (type === 'string' || type === 'text') {
		const max = maxLength === undefined ? validations.maxLength : maxLength;

		// Check length
		if (max && !isLength(valueAsString, {min: 0, max})) {
			return [`${context} exceeds the maxLength of ${max}`, null];
		}

		if (valueAsString !== value) {
			return [null, valueAsString];
		}
	}

	return [null, undefined];
}

/**
 * @typedef {object} MinimumViableModel
 * @property {(column: string) => boolean} [changed]
 * @property  {(column: string) => any} get
 * @property  {(column: string, value: any) => void} set
 */

// Validation has a couple of edge cases, there are quite a few branches
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
		const [errorMessage, newValue] = _validateSingleColumn(table[column], modelValue, `${tableName}.${column}`);

		if (errorMessage) {
			errors.push(errorMessage);
		} else if (newValue !== undefined) {
			model.set(column, newValue);
		}
	}

	if (errors.length > 0) {
		throw new ValidationError({context: errors});
	}
}

module.exports = {
	_validateSingleColumn,
	validateRow
};
