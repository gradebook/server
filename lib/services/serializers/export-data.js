// @ts-check
import {serializeUser} from './user.js';

export function serializeUserExport(modelResponse) {
	const exportedData = {};
	serializeUser(modelResponse.user);

	for (const course of modelResponse.courses) {
		exportedData[course.id] = course;
		delete course.id;
		delete course.user;
		course.categories = {};
	}

	for (const category of modelResponse.categories) {
		exportedData[category.course].categories[category.id] = category;
		delete category.id;
		delete category.user;
		delete category.course;
		category.grades = [];
	}

	for (const grade of modelResponse.grades) {
		exportedData[grade.course].categories[grade.category].grades.push(grade);
		delete grade.id;
		delete grade.user;
		delete grade.course;
		delete grade.category;
	}

	delete modelResponse.grades;
	delete modelResponse.categories;

	for (const course in exportedData) {
		if (Object.hasOwnProperty.call(exportedData, course)) {
			exportedData[course].categories = Object.values(exportedData[course].categories);
		}
	}

	modelResponse.courses = Object.values(exportedData);
}
