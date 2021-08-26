// @ts-check
const {ConsistencyError} = require('../../errors');

// This function should NEVER be called! The response should contain no
// data, which means something went awry in the processing pipeline
module.exports = context => {
	throw new ConsistencyError({
		err: new Error('Response body should be empty!'),
		context,
	});
};
