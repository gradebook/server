// @ts-check
/** @param {string} column @returns {string} */
module.exports.unsnake = column => {
	// Matches user_id, course_id, and category_id
	if (column.slice(-3) === '_id') {
		return column.slice(0, -3);
	}

	return column;
};

/** @param {string} column @returns {string} */
module.exports.snake = column => {
	if (column === 'user' || column === 'course' || column === 'category') {
		return `${column}_id`;
	}

	return column;
};
