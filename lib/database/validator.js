// @ts-check
// Modified version of Ghost's validator

import isBoolean from 'validator/lib/isBoolean.js';
import isLength from 'validator/lib/isLength.js';
import isInt from 'validator/lib/isInt.js';
import isFloatImport from 'validator/lib/isFloat.js';
import {ValidationError} from '../errors/index.js';
import schema from './schema.js';

const isFloat = isFloatImport.default;

function isEmpty(object) {
	if (object === undefined) {
		return true;
	}

	if (Array.isArray(object)) {
		return object.length === 0;
	}

	const stringValue = toString(object);
	if (stringValue.indexOf('[object ') === 0 && stringValue.at(-1) === ']') {
		return Object.keys(stringValue).length === 0;
	}

	return stringValue === '';
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

	switch (type) {
		case 'integer': {
			if (unsigned) {
				min = 0;
				max = 4_294_967_295;
			} else {
				min = -2_147_483_648;
				max = 2_147_483_647;
			}

			break;
		}

		case 'tinyint': {
			if (unsigned) {
				min = 0;
				max = 255;
			} else {
				min = -128;
				max = 127;
			}

			break;
		}

		case 'smallint': {
			if (unsigned) {
				min = 0;
				max = 65_535;
			} else {
				min = -32_768;
				max = 32_767;
			}

			break;
		}

		case 'mediumint': {
			if (unsigned) {
				min = 0;
				max = 16_777_215;
			} else {
				min = -8_388_608;
				max = 8_388_607;
			}

			break;
		}

		case 'bigint': {
			if (unsigned) {
				min = 0;
				max = (2 ** 64) - 1;
			} else {
				min = -(2 ** 63);
				max = (2 ** 63) - 1;
			}

			break;
		}
	// No default
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
export function _validateSingleColumn(columnSpec, value, context) {
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
		(type === 'integer' || type === 'tinyint' || type === 'smallint' || type === 'mediumint' || type === 'bigint')
		&& !isValidNumber(value, type, unsigned, validations.between)
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
 * @property {readonly string[]} columns
 * @property {(column: string) => boolean} [changed]
 * @property  {(column: string) => any} get
 * @property  {(column: string, value: any) => void} set
 */

/**
* Validate an existing database row
* @param {string} tableName
* @param {MinimumViableModel} model
* @param {object} options
* @param {'update' | 'insert'} options.method
*/
function validateRow(tableName, model, {method}) {
	const tableSchema = schema[tableName];
	const columns = Object.keys(tableSchema);
	const forUpdate = method === 'update';
	const errors = [];

	for (const columnName of columns) {
		if (forUpdate && !model.changed(columnName)) {
			continue;
		}

		const modelValue = model.get(columnName);
		const [errorMessage, newValue] = _validateSingleColumn(
			tableSchema[columnName], modelValue, `${tableName}.${columnName}`,
		);

		if (errorMessage) {
			errors.push(errorMessage);
		} else if (newValue !== undefined) {
			model.set(columnName, newValue);
		}
	}

	if (errors.length > 0) {
		throw new ValidationError({context: errors});
	}
}

export default validateRow;
