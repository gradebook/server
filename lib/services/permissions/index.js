const permissions = {
	browseCourse: require('../validation/is-valid'),
	browseCategory: require('../validation/is-valid'),
	browseGrade: require('../validation/is-valid'),
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
	deleteCourse: require('./edit-course'),
	deleteCategory: require('./edit-category'),
	deleteGrade: require('./edit-grade'),
	batchEditGrades: require('./batch-edit-grades'),
	expandCategory: require('./expand-category'),
	contractCategory: require('./contract-category')
};

module.exports = function findAssociatedPermission(name) {
	// eslint-disable-next-line no-prototype-builtins
	if (!permissions.hasOwnProperty(name)) {
		throw new Error(`Unable to find validation ${name}`);
	}

	return permissions[name];
};

module.exports.permissions = permissions;
