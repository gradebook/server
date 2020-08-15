const permissions = {
	// NOTE: you always have permission to browse your own data
	browseCourse: require('../../utils/noop'),
	browseCategory: require('../../utils/noop'),
	browseGrade: require('../../utils/noop'),
	readCourse: require('./edit-course'),
	readCategory: require('./edit-category'),
	readGrade: require('./edit-grade'),
	createCourse: require('./create-course'),
	importCourse: require('./create-course'),
	createCategory: require('./create-category'),
	createGrade: require('./create-grade'),
	editCourse: require('./edit-course'),
	editCategory: require('./edit-category'),
	editGrade: require('./edit-grade'),
	// Semesters are not unique across users so there's no real "validation" or "permissions" checks
	deleteSemester: require('../../utils/noop'),
	deleteCourse: require('./edit-course'),
	deleteCategory: require('./edit-category'),
	deleteGrade: require('./edit-grade'),
	batchEditGrades: require('./batch-edit-grades'),
	// NOTE: You always have permission to view / edit your own settings
	userSettings: require('../../utils/noop'),
	exportData: require('../../utils/noop'),
	expandCategory: require('./expand-category')
};

module.exports = permissions;
