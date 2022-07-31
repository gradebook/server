// @ts-check
/** @param {string} column @returns {string} */
export function unsnake(column) {
	if (column === 'user_id') {
		return 'user';
	}

	if (column === 'credit_hours') {
		return 'credits';
	}

	return column;
}

/** @param {string} column @returns {string} */
export function snake(column) {
	if (column === 'user') {
		return 'user_id';
	}

	if (column === 'credits') {
		return 'credit_hours';
	}

	return column;
}
