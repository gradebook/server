// @ts-check

const NOOP = 'NOOP';
const user = require('./user');
const course = require('./course');
const category = require('./category');
const grade = require('./grade');

/**
* @param {(key: string) => string} unSnakeCase
* @param {object} object
*/
function serializeObject(unSnakeCase, object, removeOldKey = false) {
	for (const key in object) {
		if (Object.hasOwnProperty.call(object, key)) {
			const unSnakedKey = unSnakeCase(key);

			if (key !== unSnakedKey) {
				object[unSnakedKey] = object[key];
				if (removeOldKey) {
					delete object[key];
				}
			}
		}
	}

	return object;
}

/**
* @param {string} table
* @returns {((key: string) => string) | 'NOOP'}
*/
function getSerializer(table) {
	if (table === 'users') {
		return user.unsnake;
	}

	if (table === 'courses') {
		return course.unsnake;
	}

	if (table === 'categories') {
		return category.unsnake;
	}

	if (table === 'grades') {
		return grade.unsnake;
	}

	throw new Error(`Unknown table: ${table}`);
}

/**
* @template T
* @param {T & object} response
* @param {'users' | 'courses' | 'categories' | 'grades'} table
* @returns {T}
*/
module.exports = function serializeKnexResponse(response, table, removeOldKey) {
	const serializer = getSerializer(table);

	if (serializer === NOOP) {
		return response;
	}

	if (Array.isArray(response)) {
		for (const row of response) {
			serializeObject(serializer, row, removeOldKey);
		}
	} else {
		serializeObject(serializer, response, removeOldKey);
	}

	return response;
};

module.exports.serializeObject = serializeObject;
module.exports.transformSingle = (key, table) => {
	const serialize = getSerializer(table);

	if (serialize === 'NOOP') {
		return key;
	}

	return serialize(key);
};
