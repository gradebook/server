const createResponseClass = require('./database-response');
const createCreateClass = require('./create-row');

module.exports = {
	response: createResponseClass('users'),
	create: createCreateClass('users')
};
