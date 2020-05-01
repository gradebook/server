const validations = {
	browseCourse: require('./is-valid'),
	browseCategory: require('./is-valid'),
	browseGrade: require('./browse-grades'),
	readCourse: require('./for-read-delete'),
	readCategory: require('./for-read-delete'),
	readGrade: require('./for-read-delete'),
	createCourse: require('./create-course'),
	importCourse: require('./import-course'),
	createCategory: require('./create-category'),
	createGrade: require('./create-grade'),
	editCourse: require('./edit-course'),
	editCategory: require('./edit-category'),
	editGrade: require('./edit-grade'),
	deleteCourse: require('./for-read-delete'),
	deleteCategory: require('./for-read-delete'),
	deleteGrade: require('./for-read-delete'),
	batchEditGrades: require('./batch-edit-grades'),
	expandCategory: require('./expand-category'),
	contractCategory: require('./contract-category'),
	userSettings: require('./user-settings')
};

module.exports = validations;
