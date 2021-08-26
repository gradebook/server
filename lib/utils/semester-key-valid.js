// SPRING | SUMMER | FALL | WINTER
const ALLOWED_SEMESTERS = new Set(['S', 'U', 'F', 'W']);

/**
 * Determines if a semester key is valid
 * @param {any} code
 * @returns {boolean}
*/
module.exports = function semesterCodeIsValid(code) {
	// Code must follow the format {4-letter-year}{1-letter-semester}
	return (
		typeof code === 'string'
		&& code.length === 5
		&& !Number.isNaN(Number(code.slice(0, 4)))
		&& ALLOWED_SEMESTERS.has(code.slice(4))
	);
};
