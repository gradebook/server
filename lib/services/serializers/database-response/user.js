// @ts-check
/** @param {string} column @returns {string} */
export function unsnake(column) {
	// Matches first_name and last_name
	if (column.slice(-5) === '_name') {
		return `${column.slice(0, -5)}Name`;
	}

	// Matches created_at and updated_at
	if (column.slice(-3) === '_at') {
		return column.slice(0, -3);
	}

	if (column === 'total_school_changes') {
		return 'totalSchoolChanges';
	}

	return column;
}

/** @param {string} column @returns {string} */
export function snake(column) {
	// Matches firstName and lastName
	if (column.slice(-4) === 'Name') {
		return `${column.slice(0, -4)}_name`;
	}

	if (column === 'updated' || column === 'created' || column === 'donated') {
		return `${column}_at`;
	}

	if (column === 'totalSchoolChanges') {
		return 'total_school_changes';
	}

	return column;
}
