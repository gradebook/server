const createResponseClass = require('./database-response');
const createCreateClass = require('./create-row');

module.exports = {
	response: createResponseClass('categories'),
	create: createCreateClass('categories')
};
