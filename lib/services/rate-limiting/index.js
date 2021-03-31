const limiters = {
	authenticated: require('./authenticated'),
	unauthenticated: require('./unauthenticated'),
	batchEditGrades: require('./batch-edit-grades'),
	exportData: require('./export-data'),
	createCourse: require('./create-course')
};

module.exports = limiters;
