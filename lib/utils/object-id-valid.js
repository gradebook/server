const ObjectID = require('bson-objectid');

module.exports = function isObjectIDValid(unknownString) {
	return ObjectID.isValid(unknownString);
};
