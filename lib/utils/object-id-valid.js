// @ts-check
import ObjectID from 'bson-objectid';

export function isObjectIDValid(unknownString) {
	return ObjectID.isValid(unknownString);
}
