// @ts-check
/** @param {string} column @returns {string} */
export function unsnake(column) {
	if (column === 'course_id') {
		return 'course';
	}

	if (column === 'dropped_grades') {
		return 'dropped';
	}

	return column;
}

/** @param {string} column @returns {string} */
export function snake(column) {
	if (column === 'course') {
		return 'course_id';
	}

	if (column === 'dropped') {
		return 'dropped_grades';
	}

	return column;
}
