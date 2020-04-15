const createCourse = require('./create-course');

// We can use the create course permissions check for number of courses
// Schema validation checked that there weren't too many categories
// @todo: Is there anything else we need here?
module.exports = createCourse;
