// SPRING | SUMMER | FALL | WINTER
const ALLOWED_SEMESTERS = ['S', 'U', 'F', 'W'];

/*
 * @name: semesterCodeIsValid
 * @description: determines if {code} is a valid semester code
 * @param code (string): the code to validate
 * @returns boolean isValid: whether the code is valid or not
*/
module.exports = function semesterCodeIsValid(code = '') {
	// Code must follow the format {4-letter-year}{1-letter-semester}
	return (
		code.length === 5 &&
		!isNaN(code.substr(0, 4)) &&
		ALLOWED_SEMESTERS.includes(code.substr(4))
	);
};
