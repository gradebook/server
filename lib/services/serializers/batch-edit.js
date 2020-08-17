const serializeGrade = require('./grade');

module.exports = function serializeBatchResponse({created, updated}) {
	for (const grade of created) {
		serializeGrade(grade);
	}

	for (const grade of updated) {
		serializeGrade(grade);
	}
};
