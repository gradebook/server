const validations = {
	// NOTE: Course and Categories don't have filters in the controller layer
	browseCourse: require('./browse-courses'),
	browseCategory: require('./browse-categories'),
	browseGrade: require('./browse-grades'),
	readCourse: require('./for-read-delete'),
	readCategory: require('./for-read-delete'),
	readGrade: require('./for-read-delete'),
	legacyCreateCourse: require('./legacy-create-course'),
	createCourse: require('./create-course'),
	createCategory: require('./create-category'),
	createGrade: require('./create-grade'),
	editCourse: require('./edit-course'),
	courseSettings: require('./course-settings'),
	editCategory: require('./edit-category'),
	editGrade: require('./edit-grade'),
	// Semesters are not unique across users so there's no real "validation" or "permissions" checks
	deleteSemester: require('../../utils/noop'),
	deleteCourse: require('./for-read-delete'),
	deleteCategory: require('./for-read-delete'),
	deleteGrade: require('./for-read-delete'),
	batchEditGrades: require('./batch-edit-grades'),
	// NOTE: There's nothing to validate for data exporting
	exportData: require('../../utils/noop'),
	userSettings: require('./user-settings')
};

module.exports = validations;
