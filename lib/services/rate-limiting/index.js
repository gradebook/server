const limiters = {
	authenticated: require('./authenticated'),
	unauthenticated: require('./unauthenticated'),
	batchEditGrades: require('./batch-edit-grades'),
	exportData: require('./export-data'),
	importCourse: require('./import-course')
};

module.exports = function findAssociatedLimiter(name) {
	// eslint-disable-next-line no-prototype-builtins
	if (!limiters.hasOwnProperty(name)) {
		throw new Error(`Unable to find limiter ${name}`);
	}

	return limiters[name];
};

module.exports.limiters = limiters;
