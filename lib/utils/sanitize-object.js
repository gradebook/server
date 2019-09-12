const errors = require('../errors');

/* eslint-disable camelcase */
const backupProperties = {
	course_id: 'course',
	category_id: 'category'
};
/* eslint-enable camelcase */

module.exports = function createMinimalObjectValidator(schema, allowedKeys) {
	return function createSafeObject(unfilteredData, enforceRequired = true) {
		const safeData = {};

		for (const saveKey of allowedKeys) {
			let readKey = saveKey;
			const transform = backupProperties[saveKey];

			// Support trimming `_id` from keys when sending data.
			if (transform) {
				if (transform in unfilteredData && saveKey in unfilteredData) {
					throw new errors.ValidationError({context: [`Cannot provide both ${saveKey} and ${transform}`]});
				}

				readKey = transform;
			}

			if (readKey in unfilteredData) {
				safeData[saveKey] = unfilteredData[readKey];
				delete unfilteredData[readKey];
			} else if (enforceRequired && !schema[saveKey].nullable && !('defaultTo' in schema[saveKey])) {
				throw new errors.ValidationError({context: [`Property ${saveKey} is required`]});
			} else {
				delete unfilteredData[readKey];
			}
		}

		// We don't want to guard here, since this will be a sanitization error - we're only
		// using the name for the output error message
		// eslint-disable-next-line guard-for-in
		for (const key in unfilteredData) {
			throw new errors.ValidationError({context: `Unexpected property: ${key}`});
		}

		return safeData;
	};
};
