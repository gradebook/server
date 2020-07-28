// SPRING | SUMMER | FALL | WINTER
const ALLOWED_SEMESTERS = ['S', 'U', 'F', 'W'];

/**
 * Determines if a semester key is valid
 * @param {string} code
 * @returns {boolean}
*/
module.exports = function semesterCodeIsValid(code = '') {
	// Code must follow the format {4-letter-year}{1-letter-semester}
	return (
		code.length === 5 &&
		!isNaN(code.slice(0, 4)) &&
		ALLOWED_SEMESTERS.includes(code.slice(4))
	);
};
