// @ts-check

/**
* @param {(key: string) => string} unSnakeCase
* @param {object} object
* @param {boolean} removeOldKey
*/
// @todo(4.1) remove `removeOldKey` param unless absolutely necessary
export function serializeObject(unSnakeCase, object, removeOldKey = true) {
	if (Array.isArray(object)) {
		for (const actualObject of object) {
			serializeObject(unSnakeCase, actualObject, removeOldKey);
		}

		return object;
	}

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
