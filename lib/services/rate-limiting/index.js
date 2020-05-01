const limiters = {
	authenticated: require('./authenticated'),
	unauthenticated: require('./unauthenticated'),
	batchEditGrades: require('./batch-edit-grades'),
	exportData: require('./export-data'),
	importCourse: require('./import-course')
};

module.exports = limiters;
