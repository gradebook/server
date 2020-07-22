const serializeUser = require('./user');
const serializeCourse = require('./course');
const serializeCategory = require('./category');
const serializeGrade = require('./grade');

module.exports = function serializeUserExport(modelResponse) {
	serializeUser(modelResponse.user);

	for (const course of modelResponse.courses) {
		serializeCourse(course);
		delete course.user_id;
	}

	for (const category of modelResponse.categories) {
		serializeCategory(category);
	}

	for (const grade of modelResponse.grades) {
		serializeGrade(grade);
		delete grade.id;
		delete grade.user_id;
	}
};
