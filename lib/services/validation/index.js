const validations = {
	browseCourse: require('./is-valid'),
	browseCategory: require('./is-valid'),
	browseGrade: require('./browse-grades'),
	readCourse: require('./for-read-delete'),
	readCategory: require('./for-read-delete'),
	readGrade: require('./for-read-delete'),
	createCourse: require('./create-course'),
	createCategory: require('./create-category'),
	createGrade: require('./create-grade'),
	editCourse: require('./edit-course'),
	editCategory: require('./edit-category'),
	editGrade: require('./edit-grade'),
	deleteCourse: require('./for-read-delete'),
	deleteCategory: require('./for-read-delete'),
	deleteGrade: require('./for-read-delete'),
	batchEditGrades: require('./batch-edit-grades')
};

module.exports = function findAssociatedValidation(name) {
	// eslint-disable-next-line no-prototype-builtins
	if (!validations.hasOwnProperty(name)) {
		throw new Error(`Unable to find validation ${name}`);
	}

	return validations[name];
};

module.exports.validations = validations;
