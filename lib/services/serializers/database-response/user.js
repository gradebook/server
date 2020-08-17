// @ts-check
/** @param {string} column @returns {string} */
module.exports.unsnake = column => {
	// Matches first_name and last_name
	if (column.slice(-5) === '_name') {
		return `${column.slice(0, -5)}Name`;
	}

	// Matches created_at and updated_at
	if (column.slice(-3) === '_at') {
		return column.slice(0, -3);
	}

	return column;
};

/** @param {string} column @returns {string} */
module.exports.snake = column => {
	// Matches firstName and lastName
	if (column.slice(-4) === 'Name') {
		return `${column.slice(0, -4)}_name`;
	}

	if (column === 'updated' || column === 'created') {
		return `${column}_at`;
	}

	return column;
};
