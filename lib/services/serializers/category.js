// @ts-check
import {serializeGrade} from './grade.js';

export function serializeCategory(modelResponse) {
	if (Object.hasOwnProperty.call(modelResponse, 'grades')) {
		for (const grade of modelResponse.grades) {
			serializeGrade(grade);
		}
	}

	return modelResponse;
}
