// @ts-check
import {serializeGrade} from './grade.js';

export function serializeBatchResponse({created, updated}) {
	for (const grade of created) {
		serializeGrade(grade);
	}

	for (const grade of updated) {
		serializeGrade(grade);
	}
}
